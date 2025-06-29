import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
declare global {
    namespace Express {
        interface Request {
            user?: import('../entities/user.entity').User;
        }
    }
}
export declare class AuthGuard implements CanActivate {
    private readonly authService;
    private readonly reflector;
    private readonly logger;
    constructor(authService: AuthService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
export declare class OptionalAuthGuard implements CanActivate {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
