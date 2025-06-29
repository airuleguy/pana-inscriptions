import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../entities/user.entity';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: import('../entities/user.entity').User;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const endpoint = `${request.method} ${request.path}`;

    try {
      // Extract token from Authorization header
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        this.logger.warn(`No token provided for protected endpoint: ${endpoint}`);
        throw new UnauthorizedException('Authentication token required');
      }

      // Validate token and get user
      const user = await this.authService.validateToken(token);
      if (!user) {
        this.logger.warn(`Invalid token attempt for endpoint: ${endpoint}`);
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Attach user to request for use in controllers
      request.user = user;

      this.logger.debug(`Authenticated user: ${user.username} for endpoint: ${endpoint}`);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      this.logger.error(`Authentication error for endpoint: ${endpoint}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}

/**
 * Optional auth guard that doesn't throw if no token is provided
 * but still validates and attaches user if token is present
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        // No token provided, but that's okay for optional auth
        return true;
      }

      // Validate token if provided
      const user = await this.authService.validateToken(token);
      if (user) {
        request.user = user;
        this.logger.debug(`Optional auth: authenticated user ${user.username}`);
      } else {
        this.logger.debug('Optional auth: invalid token provided, continuing without user');
      }

      return true;
    } catch (error) {
      // Log error but don't block access for optional auth
      this.logger.warn(`Optional auth error: ${error.message}`);
      return true;
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
} 