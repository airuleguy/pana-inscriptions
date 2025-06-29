import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { User as UserEntity } from '../entities/user.entity';
import { LoginDto, LoginResponseDto, ValidateTokenDto, TokenValidationResponseDto } from '../dto/auth.dto';
import { JwtService } from '../services/jwt.service';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly logger;
    constructor(authService: AuthService, jwtService: JwtService);
    login(loginDto: LoginDto, request: Request): Promise<LoginResponseDto>;
    logout(authHeader: string): Promise<{
        message: string;
    }>;
    validateToken(validateTokenDto: ValidateTokenDto): Promise<TokenValidationResponseDto>;
    getCurrentUser(request: Request): Promise<Omit<UserEntity, 'passwordHash' | 'sessions'>>;
    getUserSessions(request: Request): Promise<import("../entities/user-session.entity").UserSession[]>;
    revokeAllSessions(request: Request): Promise<{
        message: string;
        revokedCount: number;
    }>;
    getSessionStats(): Promise<{
        totalActiveSessions: number;
        totalExpiredSessions: number;
        sessionsLast24h: number;
    }>;
    cleanupSessions(): Promise<{
        message: string;
        cleanedCount: number;
    }>;
    refreshToken(request: Request): Promise<LoginResponseDto>;
    verifyToken(request: Request): Promise<Omit<UserEntity, 'passwordHash' | 'sessions'>>;
}
