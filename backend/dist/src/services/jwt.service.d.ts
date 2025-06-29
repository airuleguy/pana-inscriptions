import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload } from '../dto/auth.dto';
import { User } from '../entities/user.entity';
export declare class JwtService {
    private readonly nestJwtService;
    private readonly configService;
    private readonly logger;
    private readonly jwtSecret;
    private readonly jwtExpiresIn;
    constructor(nestJwtService: NestJwtService, configService: ConfigService);
    generateToken(user: User): Promise<{
        token: string;
        jwtId: string;
        expiresIn: number;
    }>;
    verifyToken(token: string): Promise<JwtPayload>;
    decodeToken(token: string): JwtPayload | null;
    extractJwtId(token: string): Promise<string | null>;
    isTokenExpired(token: string): boolean;
    getTokenExpiration(token: string): Date | null;
    private parseExpirationTime;
    getJwtConfig(): {
        secret: string;
        expiresIn: string;
    };
}
