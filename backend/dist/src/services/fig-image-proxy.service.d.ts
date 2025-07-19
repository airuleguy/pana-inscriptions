import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
export interface CachedImageData {
    data: Buffer;
    contentType: string;
    contentLength: number;
    lastModified: string;
    etag?: string;
}
export declare class FigImageProxyService {
    private readonly configService;
    private cacheManager;
    private readonly logger;
    private readonly IMAGE_CACHE_KEY_PREFIX;
    private readonly IMAGE_CACHE_TTL;
    private readonly API_TIMEOUT;
    private readonly MAX_IMAGE_SIZE;
    constructor(configService: ConfigService, cacheManager: Cache);
    getImage(figId: string): Promise<CachedImageData>;
    getOptimizedImage(figId: string, width?: number, height?: number, quality?: number): Promise<CachedImageData>;
    isImageCached(figId: string): Promise<boolean>;
    preloadImages(figIds: string[]): Promise<{
        success: number;
        failed: number;
    }>;
    clearImageCache(figId?: string): Promise<void>;
    getCacheStats(): Promise<{
        message: string;
        cacheType: string;
        ttl: number;
    }>;
}
