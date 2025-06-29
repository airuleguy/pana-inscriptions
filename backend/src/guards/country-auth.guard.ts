import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../entities/user.entity';

// Metadata key for country scoped endpoints
export const COUNTRY_SCOPED_KEY = 'country_scoped';
export const ALLOW_CROSS_COUNTRY_KEY = 'allow_cross_country';

// Decorator to mark endpoints as country-scoped
export const CountryScoped = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(COUNTRY_SCOPED_KEY, true, descriptor.value);
  };
};

// Decorator to allow cross-country access (for admin endpoints)
export const AllowCrossCountry = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(ALLOW_CROSS_COUNTRY_KEY, true, descriptor.value);
  };
};

@Injectable()
export class CountryAuthGuard extends AuthGuard {
  private readonly countryLogger = new Logger(CountryAuthGuard.name);
  private readonly countryReflector: Reflector;

  constructor(
    authService: AuthService,
    reflector: Reflector,
  ) {
    super(authService, reflector);
    this.countryReflector = reflector;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, run the parent authentication check
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const endpoint = `${request.method} ${request.path}`;

    // Check if this endpoint is country-scoped
    const isCountryScoped = this.countryReflector.get<boolean>(COUNTRY_SCOPED_KEY, handler);
    const allowCrossCountry = this.countryReflector.get<boolean>(ALLOW_CROSS_COUNTRY_KEY, handler);

    if (!isCountryScoped) {
      // Not a country-scoped endpoint, allow access
      return true;
    }

    const user = request.user;
    if (!user) {
      this.countryLogger.error(`No user found in request for country-scoped endpoint: ${endpoint}`);
      throw new ForbiddenException('User information not available');
    }

    // Admin users can access cross-country data if explicitly allowed
    if (user.role === UserRole.ADMIN && allowCrossCountry) {
      this.countryLogger.debug(`Admin user ${user.username} accessing cross-country endpoint: ${endpoint}`);
      return true;
    }

    // Extract country from query parameters, path parameters, or body
    const requestedCountry = this.extractCountryFromRequest(request);
    
    if (requestedCountry && requestedCountry !== user.country) {
      this.countryLogger.warn(
        `Country access violation: User ${user.username} (${user.country}) attempted to access ${requestedCountry} data at ${endpoint}`
      );
      throw new ForbiddenException(
        `Access denied. You can only access data for your country (${user.country})`
      );
    }

    // Automatically inject user's country into request for filtering
    this.injectUserCountry(request, user.country);

    this.countryLogger.debug(
      `Country authorization successful: User ${user.username} accessing ${user.country} data at ${endpoint}`
    );
    
    return true;
  }

  /**
   * Extract country from various parts of the request
   */
  private extractCountryFromRequest(request: Request): string | null {
    // Check query parameters
    if (request.query.country) {
      return request.query.country as string;
    }

    // Check path parameters
    if ((request.params as any).country) {
      return (request.params as any).country;
    }

    // Check request body for country field
    if (request.body && typeof request.body === 'object') {
      if (request.body.country) {
        return request.body.country;
      }
      
      // Check nested objects in arrays (for batch operations)
      if (Array.isArray(request.body)) {
        const firstItem = request.body[0];
        if (firstItem && firstItem.country) {
          return firstItem.country;
        }
      }
    }

    return null;
  }

  /**
   * Inject user's country into request for automatic filtering
   */
  private injectUserCountry(request: Request, userCountry: string): void {
    // Inject into query parameters if not already present
    if (!request.query.country) {
      request.query.country = userCountry;
    }

    // Inject into body if it's an object and doesn't have country
    if (request.body && typeof request.body === 'object') {
      if (!request.body.country) {
        request.body.country = userCountry;
      }

      // Handle array of objects (batch operations)
      if (Array.isArray(request.body)) {
        request.body.forEach(item => {
          if (item && typeof item === 'object' && !item.country) {
            item.country = userCountry;
          }
        });
      }
    }

    // Add user country to request for services to use
    (request as any).userCountry = userCountry;
  }
} 