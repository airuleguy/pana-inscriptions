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
var FigApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const axios_1 = require("axios");
let FigApiService = FigApiService_1 = class FigApiService {
    constructor(configService, cacheManager) {
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(FigApiService_1.name);
        this.CACHE_KEY = 'fig-gymnasts';
        this.CACHE_TTL = 3600;
        this.figApiUrl = 'https://www.gymnastics.sport/api/athletes.php';
    }
    async getGymnasts() {
        try {
            const cachedData = await this.cacheManager.get(this.CACHE_KEY);
            if (cachedData) {
                this.logger.log('Returning cached FIG gymnast data');
                return cachedData;
            }
            this.logger.log('Fetching gymnast data from FIG API');
            const apiUrl = `${this.figApiUrl}?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=`;
            const response = await axios_1.default.get(apiUrl, {
                timeout: 30000,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const gymnasts = response.data.map(athlete => ({
                figId: athlete.gymnastid,
                firstName: athlete.preferredfirstname,
                lastName: athlete.preferredlastname,
                gender: athlete.gender === 'male' ? 'M' : 'F',
                country: athlete.country,
                birthDate: athlete.birth,
                discipline: athlete.discipline,
                isLicensed: true,
            }));
            await this.cacheManager.set(this.CACHE_KEY, gymnasts, this.CACHE_TTL);
            this.logger.log(`Cached ${gymnasts.length} gymnasts from FIG API`);
            return gymnasts;
        }
        catch (error) {
            this.logger.error('Failed to fetch gymnasts from FIG API', error);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('FIG API timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            throw new common_1.HttpException('Failed to fetch gymnast data', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getGymnastsByCountry(country) {
        try {
            const cacheKey = `${this.CACHE_KEY}-${country.toUpperCase()}`;
            const cachedData = await this.cacheManager.get(cacheKey);
            if (cachedData) {
                this.logger.log(`Returning cached FIG gymnast data for country: ${country}`);
                return cachedData;
            }
            this.logger.log(`Fetching gymnast data from FIG API for country: ${country}`);
            const countrySpecificUrl = `${this.figApiUrl}?function=searchLicenses&discipline=AER&country=${encodeURIComponent(country.toUpperCase())}&idlicense=&lastname=`;
            const response = await axios_1.default.get(countrySpecificUrl, {
                timeout: 30000,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const gymnasts = response.data.map(athlete => ({
                figId: athlete.gymnastid,
                firstName: athlete.preferredfirstname,
                lastName: athlete.preferredlastname,
                gender: athlete.gender === 'male' ? 'M' : 'F',
                country: athlete.country,
                birthDate: athlete.birth,
                discipline: athlete.discipline,
                isLicensed: true,
            }));
            await this.cacheManager.set(cacheKey, gymnasts, this.CACHE_TTL);
            this.logger.log(`Cached ${gymnasts.length} gymnasts from FIG API for country: ${country}`);
            return gymnasts;
        }
        catch (error) {
            this.logger.error(`Failed to fetch gymnasts from FIG API for country: ${country}`, error);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('FIG API timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            this.logger.log(`Falling back to filtering all gymnasts for country: ${country}`);
            const allGymnasts = await this.getGymnasts();
            return allGymnasts.filter(gymnast => gymnast.country.toLowerCase() === country.toLowerCase());
        }
    }
    async getGymnastByFigId(figId) {
        const allGymnasts = await this.getGymnasts();
        return allGymnasts.find(gymnast => gymnast.figId === figId) || null;
    }
    async clearCache() {
        await this.cacheManager.del(this.CACHE_KEY);
        this.logger.log('FIG gymnast cache cleared');
    }
};
exports.FigApiService = FigApiService;
exports.FigApiService = FigApiService = FigApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], FigApiService);
//# sourceMappingURL=fig-api.service.js.map