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
var FigImageProxyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigImageProxyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fig_image_proxy_service_1 = require("../services/fig-image-proxy.service");
let FigImageProxyController = FigImageProxyController_1 = class FigImageProxyController {
    constructor(figImageProxyService) {
        this.figImageProxyService = figImageProxyService;
        this.logger = new common_1.Logger(FigImageProxyController_1.name);
    }
    async getFigImage(figId, res, width, height, quality) {
        try {
            const imageData = await this.figImageProxyService.getOptimizedImage(figId, width, height, quality);
            res.set({
                'Content-Type': imageData.contentType,
                'Content-Length': imageData.contentLength.toString(),
                'Last-Modified': imageData.lastModified,
                'Cache-Control': 'public, max-age=86400, immutable',
                'ETag': imageData.etag || `"fig-${figId}-${imageData.contentLength}"`,
                'X-Content-Source': 'FIG-Proxy-Cache',
            });
            res.status(common_1.HttpStatus.OK).send(imageData.data);
            this.logger.debug(`Served image for FIG ID: ${figId} (${imageData.contentLength} bytes)`);
        }
        catch (error) {
            this.logger.error(`Error serving image for FIG ID: ${figId}`, error.message);
            throw error;
        }
    }
    async getFigImageInfo(figId) {
        const isImageCached = await this.figImageProxyService.isImageCached(figId);
        let imageData = null;
        if (isImageCached) {
            try {
                imageData = await this.figImageProxyService.getImage(figId);
            }
            catch (error) {
                this.logger.warn(`Failed to retrieve cached image info for FIG ID: ${figId}`, error.message);
            }
        }
        return {
            figId,
            imageUrl: `https://www.gymnastics.sport/asset.php?id=bpic_${figId}`,
            proxyUrl: `/api/v1/images/fig/${figId}`,
            cached: isImageCached,
            contentType: imageData?.contentType || null,
            contentLength: imageData?.contentLength || null,
            lastModified: imageData?.lastModified || null,
        };
    }
    async preloadImages(body) {
        const { figIds } = body;
        const result = await this.figImageProxyService.preloadImages(figIds);
        return {
            message: 'Preload completed',
            total: figIds.length,
            success: result.success,
            failed: result.failed,
        };
    }
    async clearImageCache() {
        await this.figImageProxyService.clearImageCache();
    }
    async clearSpecificImageCache(figId) {
        await this.figImageProxyService.clearImageCache(figId);
    }
    async getCacheStats() {
        return this.figImageProxyService.getCacheStats();
    }
};
exports.FigImageProxyController = FigImageProxyController;
__decorate([
    (0, common_1.Get)('fig/:figId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get FIG person image',
        description: 'Retrieve a cached and optimized image for a FIG person (athlete, coach, or judge)'
    }),
    (0, swagger_1.ApiParam)({
        name: 'figId',
        description: 'FIG ID of the person',
        example: '91998'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'width',
        required: false,
        description: 'Desired image width in pixels',
        example: 150
    }),
    (0, swagger_1.ApiQuery)({
        name: 'height',
        required: false,
        description: 'Desired image height in pixels',
        example: 200
    }),
    (0, swagger_1.ApiQuery)({
        name: 'quality',
        required: false,
        description: 'Image quality (1-100)',
        example: 85
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Image returned successfully',
        headers: {
            'Content-Type': { description: 'Image MIME type' },
            'Content-Length': { description: 'Image size in bytes' },
            'Cache-Control': { description: 'Client caching directive' },
            'ETag': { description: 'Entity tag for caching' },
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Image not found for this FIG ID'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid FIG ID format'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.TOO_MANY_REQUESTS,
        description: 'FIG API rate limit exceeded'
    }),
    __param(0, (0, common_1.Param)('figId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('width')),
    __param(3, (0, common_1.Query)('height')),
    __param(4, (0, common_1.Query)('quality')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], FigImageProxyController.prototype, "getFigImage", null);
__decorate([
    (0, common_1.Get)('fig/:figId/info'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get FIG image information',
        description: 'Get metadata about a FIG image without downloading the actual image data'
    }),
    (0, swagger_1.ApiParam)({
        name: 'figId',
        description: 'FIG ID of the person',
        example: '91998'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Image information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                figId: { type: 'string', example: '91998' },
                imageUrl: { type: 'string', example: 'https://www.gymnastics.sport/asset.php?id=bpic_91998' },
                proxyUrl: { type: 'string', example: '/api/v1/images/fig/91998' },
                cached: { type: 'boolean', example: true },
                contentType: { type: 'string', example: 'image/jpeg' },
                contentLength: { type: 'number', example: 45678 },
                lastModified: { type: 'string', example: '2024-01-15T10:30:00Z' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('figId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FigImageProxyController.prototype, "getFigImageInfo", null);
__decorate([
    (0, common_1.Post)('preload'),
    (0, swagger_1.ApiOperation)({
        summary: 'Preload multiple FIG images',
        description: 'Warmup the cache by preloading images for multiple FIG IDs'
    }),
    (0, swagger_1.ApiBody)({
        description: 'List of FIG IDs to preload',
        schema: {
            type: 'object',
            properties: {
                figIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['91998', '12345', '67890']
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Preload completed',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Preload completed' },
                total: { type: 'number', example: 10 },
                success: { type: 'number', example: 8 },
                failed: { type: 'number', example: 2 }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FigImageProxyController.prototype, "preloadImages", null);
__decorate([
    (0, common_1.Delete)('cache'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear image cache',
        description: 'Clear all cached FIG images to force fresh fetches'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Image cache cleared successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FigImageProxyController.prototype, "clearImageCache", null);
__decorate([
    (0, common_1.Delete)('cache/:figId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear specific image from cache',
        description: 'Clear cached image for a specific FIG ID'
    }),
    (0, swagger_1.ApiParam)({
        name: 'figId',
        description: 'FIG ID of the person',
        example: '91998'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Image cache cleared for specific FIG ID'
    }),
    __param(0, (0, common_1.Param)('figId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FigImageProxyController.prototype, "clearSpecificImageCache", null);
__decorate([
    (0, common_1.Get)('cache/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get image cache statistics',
        description: 'Get information about the image cache status'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Cache statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'FIG Image Proxy Cache Active' },
                cacheType: { type: 'string', example: 'In-Memory with 24h TTL' },
                ttl: { type: 'number', example: 86400 }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FigImageProxyController.prototype, "getCacheStats", null);
exports.FigImageProxyController = FigImageProxyController = FigImageProxyController_1 = __decorate([
    (0, swagger_1.ApiTags)('images'),
    (0, common_1.Controller)('images'),
    __metadata("design:paramtypes", [fig_image_proxy_service_1.FigImageProxyService])
], FigImageProxyController);
//# sourceMappingURL=fig-image-proxy.controller.js.map