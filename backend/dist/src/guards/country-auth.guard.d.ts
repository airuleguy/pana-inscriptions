import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
export declare const COUNTRY_SCOPED_KEY = "country_scoped";
export declare const ALLOW_CROSS_COUNTRY_KEY = "allow_cross_country";
export declare const CountryScoped: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const AllowCrossCountry: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare class CountryAuthGuard extends AuthGuard {
    private readonly countryLogger;
    private readonly countryReflector;
    constructor(authService: AuthService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractCountryFromRequest;
    private injectUserCountry;
}
