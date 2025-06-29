import { User } from './user.entity';
export declare class UserSession {
    id: string;
    user: User;
    jwtId: string;
    expiresAt: Date;
    isRevoked: boolean;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}
