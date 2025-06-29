import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret-key-change-in-production';
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '30d';
  }

  /**
   * Generate JWT token for authenticated user
   */
  async generateToken(user: User): Promise<{ token: string; jwtId: string; expiresIn: number }> {
    try {
      const jwtId = uuidv4();
      const expiresIn = this.parseExpirationTime(this.jwtExpiresIn);

      const payload = {
        sub: user.id,
        username: user.username,
        country: user.country,
        role: user.role,
        jti: jwtId,
      };

      const token = await this.nestJwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: this.jwtExpiresIn,
      });

      this.logger.log(`Generated JWT token for user: ${user.username} (${user.country})`);

      return { token, jwtId, expiresIn };
    } catch (error) {
      this.logger.error(`Failed to generate JWT token for user: ${user.username}`, error.stack);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.nestJwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSecret,
      });

      return payload;
    } catch (error) {
      this.logger.warn(`JWT token verification failed: ${error.message}`);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode JWT token without verification (for debugging purposes)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.nestJwtService.decode(token) as JwtPayload;
    } catch (error) {
      this.logger.warn(`Failed to decode JWT token: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract JWT ID from token
   */
  async extractJwtId(token: string): Promise<string | null> {
    try {
      const payload = await this.verifyToken(token);
      return payload.jti;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return true;

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration date
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return null;

      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const timeValue = parseInt(expiresIn);
    const timeUnit = expiresIn.slice(-1);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        // Default to 30 days if no unit specified
        return timeValue * 24 * 60 * 60;
    }
  }

  /**
   * Get JWT configuration
   */
  getJwtConfig() {
    return {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    };
  }
} 