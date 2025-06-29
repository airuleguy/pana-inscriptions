import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { JwtService } from './jwt.service';
import { LoginDto, LoginResponseDto } from '../dto/auth.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly sessionRepository;
    private readonly jwtService;
    private readonly logger;
    private readonly saltRounds;
    constructor(userRepository: Repository<User>, sessionRepository: Repository<UserSession>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    logout(token: string): Promise<{
        message: string;
    }>;
    validateToken(token: string): Promise<User | null>;
    getUserById(userId: string): Promise<User | null>;
    getUserSessions(userId: string): Promise<UserSession[]>;
    revokeAllUserSessions(userId: string): Promise<{
        message: string;
        revokedCount: number;
    }>;
    cleanupExpiredSessions(): Promise<{
        message: string;
        cleanedCount: number;
    }>;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hash: string): Promise<boolean>;
    getSessionStats(): Promise<{
        totalActiveSessions: number;
        totalExpiredSessions: number;
        sessionsLast24h: number;
    }>;
    createSession(user: User, jwtId: string, expiresAt: Date, ipAddress?: string, userAgent?: string): Promise<UserSession>;
}
