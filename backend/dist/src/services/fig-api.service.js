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
        this.COACH_CACHE_KEY = 'fig-coaches';
        this.JUDGE_CACHE_KEY = 'fig-judges';
        const figApiConfig = this.configService.get('figApi');
        const cacheConfig = this.configService.get('cache');
        this.figApiUrl = `${figApiConfig.baseUrl}${figApiConfig.athletesEndpoint}`;
        this.figCoachApiUrl = `${figApiConfig.baseUrl}${figApiConfig.coachesEndpoint}`;
        this.figJudgeApiUrl = `${figApiConfig.baseUrl}${figApiConfig.judgesEndpoint}`;
        this.CACHE_TTL = cacheConfig.ttl;
        this.API_TIMEOUT = figApiConfig.timeout;
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
                timeout: this.API_TIMEOUT,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const gymnasts = response.data.map(athlete => {
                const licenseExpiryDate = new Date(athlete.validto + 'T00:00:00Z');
                const isLicenseValid = licenseExpiryDate > new Date();
                return {
                    figId: athlete.gymnastid,
                    firstName: athlete.preferredfirstname,
                    lastName: athlete.preferredlastname,
                    gender: athlete.gender === 'male' ? 'M' : 'F',
                    country: athlete.country,
                    birthDate: athlete.birth,
                    discipline: athlete.discipline,
                    isLicensed: isLicenseValid,
                    licenseExpiryDate: athlete.validto,
                };
            });
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
                timeout: this.API_TIMEOUT,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const gymnasts = response.data.map(athlete => {
                const licenseExpiryDate = new Date(athlete.validto + 'T00:00:00Z');
                const isLicenseValid = licenseExpiryDate > new Date();
                return {
                    figId: athlete.gymnastid,
                    firstName: athlete.preferredfirstname,
                    lastName: athlete.preferredlastname,
                    gender: athlete.gender === 'male' ? 'M' : 'F',
                    country: athlete.country,
                    birthDate: athlete.birth,
                    discipline: athlete.discipline,
                    isLicensed: isLicenseValid,
                    licenseExpiryDate: athlete.validto,
                };
            });
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
    async getCoaches() {
        try {
            const cachedData = await this.cacheManager.get(this.COACH_CACHE_KEY);
            if (cachedData) {
                this.logger.log('Returning cached FIG coach data');
                return cachedData;
            }
            this.logger.log('Fetching coach data from FIG API');
            const apiUrl = `${this.figCoachApiUrl}?function=searchAcademic&discipline=AER&country=&id=&level=&lastname=&firstname=`;
            const response = await axios_1.default.get(apiUrl, {
                timeout: this.API_TIMEOUT,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG Coach API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const coaches = response.data.map(coach => ({
                id: coach.id,
                firstName: coach.preferredfirstname,
                lastName: coach.preferredlastname,
                gender: coach.gender,
                country: coach.country,
                discipline: coach.discipline,
                level: coach.level,
            }));
            await this.cacheManager.set(this.COACH_CACHE_KEY, coaches, this.CACHE_TTL);
            this.logger.log(`Cached ${coaches.length} coaches from FIG API`);
            return coaches;
        }
        catch (error) {
            this.logger.error('Failed to fetch coaches from FIG API', error);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG Coach API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('FIG Coach API timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            throw new common_1.HttpException('Failed to fetch coach data', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getCoachesByCountry(country) {
        try {
            const cacheKey = `${this.COACH_CACHE_KEY}-${country.toUpperCase()}`;
            const cachedData = await this.cacheManager.get(cacheKey);
            if (cachedData) {
                this.logger.log(`Returning cached FIG coach data for country: ${country}`);
                return cachedData;
            }
            this.logger.log(`Fetching coach data from FIG API for country: ${country}`);
            const countrySpecificUrl = `${this.figCoachApiUrl}?function=searchAcademic&discipline=AER&country=${encodeURIComponent(country.toUpperCase())}&id=&level=&lastname=&firstname=`;
            const response = await axios_1.default.get(countrySpecificUrl, {
                timeout: this.API_TIMEOUT,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG Coach API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const coaches = response.data.map(coach => ({
                id: coach.id,
                firstName: coach.preferredfirstname,
                lastName: coach.preferredlastname,
                gender: coach.gender,
                country: coach.country,
                discipline: coach.discipline,
                level: coach.level,
            }));
            await this.cacheManager.set(cacheKey, coaches, this.CACHE_TTL);
            this.logger.log(`Cached ${coaches.length} coaches from FIG API for country: ${country}`);
            return coaches;
        }
        catch (error) {
            this.logger.error(`Failed to fetch coaches from FIG API for country: ${country}`, error);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG Coach API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('FIG Coach API timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            this.logger.log(`Falling back to filtering all coaches for country: ${country}`);
            const allCoaches = await this.getCoaches();
            return allCoaches.filter(coach => coach.country.toLowerCase() === country.toLowerCase());
        }
    }
    async getCoachById(id) {
        const allCoaches = await this.getCoaches();
        return allCoaches.find(coach => coach.id === id) || null;
    }
    async clearCoachCache() {
        await this.cacheManager.del(this.COACH_CACHE_KEY);
        this.logger.log('FIG coach cache cleared');
    }
    async getJudges() {
        try {
            const cachedData = await this.cacheManager.get(this.JUDGE_CACHE_KEY);
            if (cachedData) {
                this.logger.log('Returning cached FIG judge data');
                return cachedData;
            }
            this.logger.log('Fetching judge data from FIG API');
            const apiUrl = `${this.figJudgeApiUrl}?function=search&discipline=AER&country=&id=&category=&lastname=`;
            const response = await axios_1.default.get(apiUrl, {
                timeout: this.API_TIMEOUT,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG Judge API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const judges = response.data.map(judge => ({
                id: judge.idfig,
                firstName: judge.preferredfirstname,
                lastName: judge.preferredlastname,
                birth: judge.birth,
                gender: judge.gender,
                country: judge.country,
                discipline: judge.discipline,
                category: judge.category,
            }));
            await this.cacheManager.set(this.JUDGE_CACHE_KEY, judges, this.CACHE_TTL);
            this.logger.log(`Cached ${judges.length} judges from FIG API`);
            return judges;
        }
        catch (error) {
            this.logger.error('Failed to fetch judges from FIG API', error);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG Judge API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('FIG Judge API timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            throw new common_1.HttpException('Failed to fetch judge data', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getJudgesByCountry(country) {
        try {
            const cacheKey = `${this.JUDGE_CACHE_KEY}-${country.toUpperCase()}`;
            const cachedData = await this.cacheManager.get(cacheKey);
            if (cachedData) {
                this.logger.log(`Returning cached FIG judge data for country: ${country}`);
                return cachedData;
            }
            this.logger.log(`Fetching judge data from FIG API for country: ${country}`);
            const countrySpecificUrl = `${this.figJudgeApiUrl}?function=search&discipline=AER&country=${encodeURIComponent(country.toUpperCase())}&id=&category=&lastname=`;
            const response = await axios_1.default.get(countrySpecificUrl, {
                timeout: this.API_TIMEOUT,
            });
            if (!Array.isArray(response.data)) {
                throw new common_1.HttpException('FIG Judge API returned unexpected data format', common_1.HttpStatus.BAD_GATEWAY);
            }
            const judges = response.data.map(judge => ({
                id: judge.idfig,
                firstName: judge.preferredfirstname,
                lastName: judge.preferredlastname,
                birth: judge.birth,
                gender: judge.gender,
                country: judge.country,
                discipline: judge.discipline,
                category: judge.category,
            }));
            await this.cacheManager.set(cacheKey, judges, this.CACHE_TTL);
            this.logger.log(`Cached ${judges.length} judges from FIG API for country: ${country}`);
            return judges;
        }
        catch (error) {
            this.logger.error(`Failed to fetch judges from FIG API for country: ${country}`, error);
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG Judge API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('FIG Judge API timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            this.logger.log(`Falling back to filtering all judges for country: ${country}`);
            const allJudges = await this.getJudges();
            return allJudges.filter(judge => judge.country.toLowerCase() === country.toLowerCase());
        }
    }
    async getJudgeById(id) {
        const allJudges = await this.getJudges();
        return allJudges.find(judge => judge.id === id) || null;
    }
    async clearJudgeCache() {
        await this.cacheManager.del(this.JUDGE_CACHE_KEY);
        this.logger.log('FIG judge cache cleared');
    }
};
exports.FigApiService = FigApiService;
exports.FigApiService = FigApiService = FigApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], FigApiService);
//# sourceMappingURL=fig-api.service.js.map