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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../services/auth.service");
const auth_guard_1 = require("../guards/auth.guard");
const auth_dto_1 = require("../dto/auth.dto");
const jwt_service_1 = require("../services/jwt.service");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async login(loginDto, request) {
        try {
            const ipAddress = loginDto.ipAddress || request.ip || request.socket.remoteAddress;
            const userAgent = loginDto.userAgent || request.get('User-Agent');
            const loginData = {
                ...loginDto,
                ipAddress,
                userAgent,
            };
            const result = await this.authService.login(loginData);
            this.logger.log(`Login successful for user: ${loginDto.username}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Login failed for user: ${loginDto.username}`, error.stack);
            throw error;
        }
    }
    async logout(authHeader) {
        try {
            const token = authHeader?.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }
            const result = await this.authService.logout(token);
            this.logger.log('User logged out successfully');
            return result;
        }
        catch (error) {
            this.logger.error('Logout failed', error.stack);
            throw error;
        }
    }
    async validateToken(validateTokenDto) {
        try {
            const user = await this.authService.validateToken(validateTokenDto.token);
            if (user) {
                return {
                    isValid: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        country: user.country,
                        role: user.role,
                    },
                };
            }
            else {
                return {
                    isValid: false,
                    error: 'Invalid or expired token',
                };
            }
        }
        catch (error) {
            this.logger.error('Token validation error', error.stack);
            return {
                isValid: false,
                error: 'Token validation failed',
            };
        }
    }
    async getCurrentUser(request) {
        const user = request.user;
        this.logger.log(`Getting current user info for: ${user.username}`);
        const { passwordHash, sessions, ...userInfo } = user;
        return userInfo;
    }
    async getUserSessions(request) {
        const user = request.user;
        return await this.authService.getUserSessions(user.id);
    }
    async revokeAllSessions(request) {
        const user = request.user;
        return await this.authService.revokeAllUserSessions(user.id);
    }
    async getSessionStats() {
        return await this.authService.getSessionStats();
    }
    async cleanupSessions() {
        return await this.authService.cleanupExpiredSessions();
    }
    async refreshToken(request) {
        try {
            const user = request.user;
            const authHeader = request.headers.authorization;
            const currentToken = authHeader?.split(' ')[1];
            if (!currentToken) {
                throw new Error('No token provided');
            }
            await this.authService.logout(currentToken);
            const { token, jwtId, expiresIn } = await this.jwtService.generateToken(user);
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            const ipAddress = request.ip || request.socket.remoteAddress;
            const userAgent = request.get('User-Agent');
            const loginData = {
                username: user.username,
                password: '',
                ipAddress,
                userAgent,
            };
            const session = await this.authService.createSession(user, jwtId, expiresAt, ipAddress, userAgent);
            this.logger.log(`Token refreshed for user: ${user.username}`);
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
            this.logger.error('Token refresh failed', error.stack);
            throw error;
        }
    }
    async verifyToken(request) {
        const user = request.user;
        this.logger.log(`Token verified for user: ${user.username}`);
        const { passwordHash, sessions, ...userInfo } = user;
        return userInfo;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Authenticate user',
        description: 'Login with username and password to receive JWT token'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.LoginDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful',
        type: auth_dto_1.LoginResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Invalid credentials'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed'
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Logout user',
        description: 'Revoke JWT token and end session'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Logout successful',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Logged out successfully' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate JWT token',
        description: 'Check if JWT token is valid and return user information'
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ValidateTokenDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token validation result',
        type: auth_dto_1.TokenValidationResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed'
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ValidateTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get current user',
        description: 'Get information about the currently authenticated user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Current user information',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                country: { type: 'string' },
                role: { type: 'string' },
                lastLoginAt: { type: 'string', format: 'date-time' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user sessions',
        description: 'Get all active sessions for the current user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'User sessions',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    jwtId: { type: 'string' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    ipAddress: { type: 'string' },
                    userAgent: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserSessions", null);
__decorate([
    (0, common_1.Delete)('sessions'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Revoke all sessions',
        description: 'Revoke all active sessions for the current user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Sessions revoked successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                revokedCount: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeAllSessions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get session statistics',
        description: 'Get system-wide session statistics (admin only in future)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Session statistics',
        schema: {
            type: 'object',
            properties: {
                totalActiveSessions: { type: 'number' },
                totalExpiredSessions: { type: 'number' },
                sessionsLast24h: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSessionStats", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Cleanup expired sessions',
        description: 'Remove expired and revoked sessions from database (admin only in future)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cleanup completed',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                cleanedCount: { type: 'number' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "cleanupSessions", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh JWT token',
        description: 'Get a new JWT token using the current valid token'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        type: auth_dto_1.LoginResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify JWT token',
        description: 'Verify that the current JWT token is valid and return user information'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token is valid',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                country: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                lastLoginAt: { type: 'string', format: 'date-time' },
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - invalid or missing token'
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_service_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map