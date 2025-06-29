#!/usr/bin/env ts-node
import { UserRole } from '../entities/user.entity';
interface TestUser {
    username: string;
    password: string;
    country: string;
    role: UserRole;
}
declare const testUsers: TestUser[];
declare function seedUsers(): Promise<void>;
export { seedUsers, testUsers };
