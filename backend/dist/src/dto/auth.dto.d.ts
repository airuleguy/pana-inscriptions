import { UserRole } from '../entities/user.entity';
export declare class LoginDto {
    username: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class LoginResponseDto {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: {
        id: string;
        username: string;
        country: string;
        role: UserRole;
        lastLoginAt?: Date;
    };
}
export declare class LogoutDto {
    token: string;
}
export declare class JwtPayload {
    sub: string;
    username: string;
    country: string;
    role: UserRole;
    jti: string;
    iat: number;
    exp: number;
}
export declare class ValidateTokenDto {
    token: string;
}
export declare class TokenValidationResponseDto {
    isValid: boolean;
    user?: {
        id: string;
        username: string;
        country: string;
        role: UserRole;
    };
    error?: string;
}
