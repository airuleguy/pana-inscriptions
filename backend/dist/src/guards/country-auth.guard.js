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
var CountryAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryAuthGuard = exports.AllowCrossCountry = exports.CountryScoped = exports.ALLOW_CROSS_COUNTRY_KEY = exports.COUNTRY_SCOPED_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const auth_guard_1 = require("./auth.guard");
const auth_service_1 = require("../services/auth.service");
const user_entity_1 = require("../entities/user.entity");
exports.COUNTRY_SCOPED_KEY = 'country_scoped';
exports.ALLOW_CROSS_COUNTRY_KEY = 'allow_cross_country';
const CountryScoped = () => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.COUNTRY_SCOPED_KEY, true, descriptor.value);
    };
};
exports.CountryScoped = CountryScoped;
const AllowCrossCountry = () => {
    return (target, propertyKey, descriptor) => {
        Reflect.defineMetadata(exports.ALLOW_CROSS_COUNTRY_KEY, true, descriptor.value);
    };
};
exports.AllowCrossCountry = AllowCrossCountry;
let CountryAuthGuard = CountryAuthGuard_1 = class CountryAuthGuard extends auth_guard_1.AuthGuard {
    constructor(authService, reflector) {
        super(authService, reflector);
        this.countryLogger = new common_1.Logger(CountryAuthGuard_1.name);
        this.countryReflector = reflector;
    }
    async canActivate(context) {
        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) {
            return false;
        }
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const endpoint = `${request.method} ${request.path}`;
        const isCountryScoped = this.countryReflector.get(exports.COUNTRY_SCOPED_KEY, handler);
        const allowCrossCountry = this.countryReflector.get(exports.ALLOW_CROSS_COUNTRY_KEY, handler);
        if (!isCountryScoped) {
            return true;
        }
        const user = request.user;
        if (!user) {
            this.countryLogger.error(`No user found in request for country-scoped endpoint: ${endpoint}`);
            throw new common_1.ForbiddenException('User information not available');
        }
        if (user.role === user_entity_1.UserRole.ADMIN && allowCrossCountry) {
            this.countryLogger.debug(`Admin user ${user.username} accessing cross-country endpoint: ${endpoint}`);
            return true;
        }
        const requestedCountry = this.extractCountryFromRequest(request);
        if (requestedCountry && requestedCountry !== user.country) {
            this.countryLogger.warn(`Country access violation: User ${user.username} (${user.country}) attempted to access ${requestedCountry} data at ${endpoint}`);
            throw new common_1.ForbiddenException(`Access denied. You can only access data for your country (${user.country})`);
        }
        this.injectUserCountry(request, user.country);
        this.countryLogger.debug(`Country authorization successful: User ${user.username} accessing ${user.country} data at ${endpoint}`);
        return true;
    }
    extractCountryFromRequest(request) {
        if (request.query.country) {
            return request.query.country;
        }
        if (request.params.country) {
            return request.params.country;
        }
        if (request.body && typeof request.body === 'object') {
            if (request.body.country) {
                return request.body.country;
            }
            if (Array.isArray(request.body)) {
                const firstItem = request.body[0];
                if (firstItem && firstItem.country) {
                    return firstItem.country;
                }
            }
        }
        return null;
    }
    injectUserCountry(request, userCountry) {
        if (!request.query.country) {
            request.query.country = userCountry;
        }
        if (request.body && typeof request.body === 'object') {
            if (!request.body.country) {
                request.body.country = userCountry;
            }
            if (Array.isArray(request.body)) {
                request.body.forEach(item => {
                    if (item && typeof item === 'object' && !item.country) {
                        item.country = userCountry;
                    }
                });
            }
        }
        request.userCountry = userCountry;
    }
};
exports.CountryAuthGuard = CountryAuthGuard;
exports.CountryAuthGuard = CountryAuthGuard = CountryAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        core_1.Reflector])
], CountryAuthGuard);
//# sourceMappingURL=country-auth.guard.js.map