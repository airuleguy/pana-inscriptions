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
var JwtService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
let JwtService = JwtService_1 = class JwtService {
    constructor(nestJwtService, configService) {
        this.nestJwtService = nestJwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(JwtService_1.name);
        this.jwtSecret = this.configService.get('JWT_SECRET') || 'default-secret-key-change-in-production';
        this.jwtExpiresIn = this.configService.get('JWT_EXPIRES_IN') || '30d';
    }
    async generateToken(user) {
        try {
            const jwtId = (0, uuid_1.v4)();
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = this.parseExpirationTime(this.jwtExpiresIn);
            const payload = {
                sub: user.id,
                username: user.username,
                country: user.country,
                role: user.role,
                jti: jwtId,
                iat: now,
                exp: now + expiresIn,
            };
            const token = await this.nestJwtService.signAsync(payload, {
                secret: this.jwtSecret,
                expiresIn: this.jwtExpiresIn,
            });
            this.logger.log(`Generated JWT token for user: ${user.username} (${user.country})`);
            return { token, jwtId, expiresIn };
        }
        catch (error) {
            this.logger.error(`Failed to generate JWT token for user: ${user.username}`, error.stack);
            throw new Error('Failed to generate authentication token');
        }
    }
    async verifyToken(token) {
        try {
            const payload = await this.nestJwtService.verifyAsync(token, {
                secret: this.jwtSecret,
            });
            return payload;
        }
        catch (error) {
            this.logger.warn(`JWT token verification failed: ${error.message}`);
            throw new Error('Invalid or expired token');
        }
    }
    decodeToken(token) {
        try {
            return this.nestJwtService.decode(token);
        }
        catch (error) {
            this.logger.warn(`Failed to decode JWT token: ${error.message}`);
            return null;
        }
    }
    async extractJwtId(token) {
        try {
            const payload = await this.verifyToken(token);
            return payload.jti;
        }
        catch (error) {
            return null;
        }
    }
    isTokenExpired(token) {
        try {
            const payload = this.decodeToken(token);
            if (!payload)
                return true;
            const now = Math.floor(Date.now() / 1000);
            return payload.exp < now;
        }
        catch (error) {
            return true;
        }
    }
    getTokenExpiration(token) {
        try {
            const payload = this.decodeToken(token);
            if (!payload)
                return null;
            return new Date(payload.exp * 1000);
        }
        catch (error) {
            return null;
        }
    }
    parseExpirationTime(expiresIn) {
        const timeValue = parseInt(expiresIn);
        const timeUnit = expiresIn.slice(-1);
        switch (timeUnit) {
            case 's':
                return timeValue;
            case 'm':
                return timeValue * 60;
            case 'h':
                return timeValue * 60 * 60;
            case 'd':
                return timeValue * 24 * 60 * 60;
            default:
                return timeValue * 24 * 60 * 60;
        }
    }
    getJwtConfig() {
        return {
            secret: this.jwtSecret,
            expiresIn: this.jwtExpiresIn,
        };
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = JwtService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], JwtService);
//# sourceMappingURL=jwt.service.js.map