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
var AuthGuard_1, OptionalAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalAuthGuard = exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_service_1 = require("../services/auth.service");
let AuthGuard = AuthGuard_1 = class AuthGuard {
    constructor(authService, reflector) {
        this.authService = authService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(AuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const endpoint = `${request.method} ${request.path}`;
        try {
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                this.logger.warn(`No token provided for protected endpoint: ${endpoint}`);
                throw new common_1.UnauthorizedException('Authentication token required');
            }
            const user = await this.authService.validateToken(token);
            if (!user) {
                this.logger.warn(`Invalid token attempt for endpoint: ${endpoint}`);
                throw new common_1.UnauthorizedException('Invalid or expired token');
            }
            request.user = user;
            this.logger.debug(`Authenticated user: ${user.username} for endpoint: ${endpoint}`);
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Authentication error for endpoint: ${endpoint}`, error.stack);
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
    extractTokenFromHeader(request) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return null;
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            return null;
        }
        return token;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = AuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        core_1.Reflector])
], AuthGuard);
let OptionalAuthGuard = OptionalAuthGuard_1 = class OptionalAuthGuard {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(OptionalAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        try {
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                return true;
            }
            const user = await this.authService.validateToken(token);
            if (user) {
                request.user = user;
                this.logger.debug(`Optional auth: authenticated user ${user.username}`);
            }
            else {
                this.logger.debug('Optional auth: invalid token provided, continuing without user');
            }
            return true;
        }
        catch (error) {
            this.logger.warn(`Optional auth error: ${error.message}`);
            return true;
        }
    }
    extractTokenFromHeader(request) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return null;
        }
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            return null;
        }
        return token;
    }
};
exports.OptionalAuthGuard = OptionalAuthGuard;
exports.OptionalAuthGuard = OptionalAuthGuard = OptionalAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], OptionalAuthGuard);
//# sourceMappingURL=auth.guard.js.map