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
var FigImageProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigImageProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const axios_1 = require("axios");
const fig_image_util_1 = require("../utils/fig-image.util");
let FigImageProxyService = FigImageProxyService_1 = class FigImageProxyService {
    constructor(configService, cacheManager) {
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(FigImageProxyService_1.name);
        this.IMAGE_CACHE_KEY_PREFIX = 'fig-image';
        const cacheConfig = this.configService.get('cache');
        const figApiConfig = this.configService.get('figApi');
        this.IMAGE_CACHE_TTL = parseInt(process.env.IMAGE_CACHE_TTL, 10) || 86400;
        this.API_TIMEOUT = figApiConfig.timeout || 30000;
        this.MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5 * 1024 * 1024;
    }
    async getImage(figId) {
        if (!figId || figId.trim() === '') {
            throw new common_1.HttpException('FIG ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const cleanFigId = figId.trim();
        const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-${cleanFigId}`;
        try {
            const cachedImage = await this.cacheManager.get(cacheKey);
            if (cachedImage) {
                this.logger.debug(`Returning cached image for FIG ID: ${cleanFigId}`);
                return cachedImage;
            }
            const imageUrl = fig_image_util_1.FigImageUtil.generateImageUrl(cleanFigId);
            if (!imageUrl) {
                throw new common_1.HttpException('Invalid FIG ID format', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`Fetching image from FIG for ID: ${cleanFigId}`);
            const response = await axios_1.default.get(imageUrl, {
                timeout: this.API_TIMEOUT,
                responseType: 'arraybuffer',
                maxContentLength: this.MAX_IMAGE_SIZE,
                headers: {
                    'Accept': 'image/*',
                    'User-Agent': 'PanamericanGymnastics/1.0',
                },
            });
            if (response.status !== 200) {
                throw new common_1.HttpException(`FIG API returned status ${response.status}`, common_1.HttpStatus.BAD_GATEWAY);
            }
            if (!response.data || response.data.length === 0) {
                throw new common_1.HttpException('Empty image data received from FIG', common_1.HttpStatus.BAD_GATEWAY);
            }
            const contentType = response.headers['content-type'] || 'image/jpeg';
            if (!contentType.startsWith('image/')) {
                this.logger.warn(`Non-image content type received for FIG ID ${cleanFigId}: ${contentType}`);
                throw new common_1.HttpException('Invalid image format received from FIG', common_1.HttpStatus.BAD_GATEWAY);
            }
            const imageData = {
                data: Buffer.from(response.data),
                contentType,
                contentLength: response.data.length,
                lastModified: response.headers['last-modified'] || new Date().toISOString(),
                etag: response.headers['etag'],
            };
            await this.cacheManager.set(cacheKey, imageData, this.IMAGE_CACHE_TTL);
            this.logger.log(`Cached image for FIG ID: ${cleanFigId} (${imageData.contentLength} bytes)`);
            return imageData;
        }
        catch (error) {
            this.logger.error(`Failed to fetch image for FIG ID: ${cleanFigId}`, error.message);
            if (error.response?.status === 404) {
                throw new common_1.HttpException('Image not found for this FIG ID', common_1.HttpStatus.NOT_FOUND);
            }
            if (error.response?.status === 429) {
                throw new common_1.HttpException('FIG API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
                throw new common_1.HttpException('Image fetch timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
            }
            if (error.code === 'MAXCONTENTLENGTH') {
                throw new common_1.HttpException('Image too large', common_1.HttpStatus.PAYLOAD_TOO_LARGE);
            }
            throw new common_1.HttpException('Failed to fetch image', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getOptimizedImage(figId, width, height, quality) {
        const originalImage = await this.getImage(figId);
        return originalImage;
    }
    async isImageCached(figId) {
        const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-${figId.trim()}`;
        const cached = await this.cacheManager.get(cacheKey);
        return cached !== undefined;
    }
    async preloadImages(figIds) {
        this.logger.log(`Preloading ${figIds.length} images`);
        let success = 0;
        let failed = 0;
        const batchSize = 5;
        for (let i = 0; i < figIds.length; i += batchSize) {
            const batch = figIds.slice(i, i + batchSize);
            const promises = batch.map(async (figId) => {
                try {
                    await this.getImage(figId);
                    success++;
                }
                catch (error) {
                    this.logger.warn(`Failed to preload image for FIG ID: ${figId}`, error.message);
                    failed++;
                }
            });
            await Promise.all(promises);
            if (i + batchSize < figIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        this.logger.log(`Image preload completed: ${success} success, ${failed} failed`);
        return { success, failed };
    }
    async clearImageCache(figId) {
        if (figId) {
            const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-${figId.trim()}`;
            await this.cacheManager.del(cacheKey);
            this.logger.log(`Cleared image cache for FIG ID: ${figId}`);
        }
        else {
            this.logger.log('Image cache cleared (specific implementation needed for pattern deletion)');
        }
    }
    async getCacheStats() {
        return {
            message: 'FIG Image Proxy Cache Active',
            cacheType: 'In-Memory with 24h TTL',
            ttl: this.IMAGE_CACHE_TTL,
        };
    }
};
exports.FigImageProxyService = FigImageProxyService;
exports.FigImageProxyService = FigImageProxyService = FigImageProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], FigImageProxyService);
//# sourceMappingURL=fig-image-proxy.service.js.map