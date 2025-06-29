import { UserSession } from './user-session.entity';
export declare enum UserRole {
    DELEGATE = "DELEGATE",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    username: string;
    passwordHash: string;
    country: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    sessions: UserSession[];
    createdAt: Date;
    updatedAt: Date;
}
