"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const user_session_entity_1 = require("../entities/user-session.entity");
const jwt_service_1 = require("./jwt.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, sessionRepository, jwtService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.saltRounds = 12;
    }
    async login(loginDto) {
        try {
            const { username, password, ipAddress, userAgent } = loginDto;
            const user = await this.userRepository.findOne({
                where: { username: username.toLowerCase() },
            });
            if (!user || !user.isActive) {
                this.logger.warn(`Login attempt failed for username: ${username}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password attempt for user: ${username}`);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const { token, jwtId, expiresIn } = await this.jwtService.generateToken(user);
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            const session = this.sessionRepository.create({
                user,
                jwtId,
                expiresAt,
                ipAddress,
                userAgent,
                isRevoked: false,
            });
            await this.sessionRepository.save(session);
            user.lastLoginAt = new Date();
            await this.userRepository.save(user);
            this.logger.log(`User logged in successfully: ${username} (${user.country})`);
            return {
                accessToken: token,
                tokenType: 'Bearer',
                expiresIn,
                user: {
                    id: user.id,
                    username: user.username,
                    country: user.country,
                    role: user.role,
                    lastLoginAt: user.lastLoginAt,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Login error: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Login failed');
        }
    }
    async logout(token) {
        try {
            const jwtId = await this.jwtService.extractJwtId(token);
            if (!jwtId) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const session = await this.sessionRepository.findOne({
                where: { jwtId },
                relations: ['user'],
            });
            if (session) {
                session.isRevoked = true;
                await this.sessionRepository.save(session);
                this.logger.log(`User logged out: ${session.user.username}`);
            }
            return { message: 'Logged out successfully' };
        }
        catch (error) {
            this.logger.error(`Logout error: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Logout failed');
        }
    }
    async validateToken(token) {
        try {
            const payload = await this.jwtService.verifyToken(token);
            const session = await this.sessionRepository.findOne({
                where: {
                    jwtId: payload.jti,
                    isRevoked: false,
                },
                relations: ['user'],
            });
            if (!session) {
                this.logger.warn(`Session not found or revoked for JWT ID: ${payload.jti}`);
                return null;
            }
            if (session.expiresAt < new Date()) {
                this.logger.warn(`Session expired for user: ${session.user.username}`);
                session.isRevoked = true;
                await this.sessionRepository.save(session);
                return null;
            }
            if (!session.user.isActive) {
                this.logger.warn(`User account inactive: ${session.user.username}`);
                return null;
            }
            return session.user;
        }
        catch (error) {
            this.logger.warn(`Token validation failed: ${error.message}`);
            return null;
        }
    }
    async getUserById(userId) {
        try {
            return await this.userRepository.findOne({
                where: { id: userId, isActive: true },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get user by ID: ${userId}`, error.stack);
            return null;
        }
    }
    async getUserSessions(userId) {
        try {
            return await this.sessionRepository.find({
                where: {
                    user: { id: userId },
                    isRevoked: false,
                },
                order: { createdAt: 'DESC' },
            });
        }
        catch (error) {
            this.logger.error(`Failed to get user sessions: ${userId}`, error.stack);
            return [];
        }
    }
    async revokeAllUserSessions(userId) {
        try {
            const result = await this.sessionRepository
                .createQueryBuilder()
                .update(user_session_entity_1.UserSession)
                .set({ isRevoked: true })
                .where('user_id = :userId AND is_revoked = false', { userId })
                .execute();
            const revokedCount = result.affected || 0;
            this.logger.log(`Revoked ${revokedCount} sessions for user: ${userId}`);
            return {
                message: `Revoked ${revokedCount} active sessions`,
                revokedCount,
            };
        }
        catch (error) {
            this.logger.error(`Failed to revoke user sessions: ${userId}`, error.stack);
            throw new common_1.BadRequestException('Failed to revoke sessions');
        }
    }
    async cleanupExpiredSessions() {
        try {
            const result = await this.sessionRepository
                .createQueryBuilder()
                .delete()
                .from(user_session_entity_1.UserSession)
                .where('expires_at < :now OR is_revoked = true', { now: new Date() })
                .execute();
            const cleanedCount = result.affected || 0;
            this.logger.log(`Cleaned up ${cleanedCount} expired/revoked sessions`);
            return {
                message: `Cleaned up ${cleanedCount} expired sessions`,
                cleanedCount,
            };
        }
        catch (error) {
            this.logger.error(`Failed to cleanup expired sessions`, error.stack);
            throw new common_1.BadRequestException('Failed to cleanup sessions');
        }
    }
    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, this.saltRounds);
        }
        catch (error) {
            this.logger.error(`Failed to hash password`, error.stack);
            throw new common_1.BadRequestException('Password processing failed');
        }
    }
    async verifyPassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        }
        catch (error) {
            this.logger.error(`Failed to verify password`, error.stack);
            return false;
        }
    }
    async getSessionStats() {
        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const [totalActive, totalExpired, recent] = await Promise.all([
                this.sessionRepository.count({
                    where: { isRevoked: false, expiresAt: { $gt: now } },
                }),
                this.sessionRepository.count({
                    where: { expiresAt: { $lt: now } },
                }),
                this.sessionRepository.count({
                    where: {
                        createdAt: { $gt: yesterday },
                        isRevoked: false
                    },
                }),
            ]);
            return {
                totalActiveSessions: totalActive,
                totalExpiredSessions: totalExpired,
                sessionsLast24h: recent,
            };
        }
        catch (error) {
            this.logger.error('Failed to get session stats', error.stack);
            return {
                totalActiveSessions: 0,
                totalExpiredSessions: 0,
                sessionsLast24h: 0,
            };
        }
    }
    async createSession(user, jwtId, expiresAt, ipAddress, userAgent) {
        try {
            const session = this.sessionRepository.create({
                user,
                jwtId,
                expiresAt,
                ipAddress,
                userAgent,
                isRevoked: false,
            });
            await this.sessionRepository.save(session);
            this.logger.log(`Created new session for user: ${user.username}`);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to create session for user: ${user.username}`, error.stack);
            throw new Error('Failed to create user session');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_service_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map