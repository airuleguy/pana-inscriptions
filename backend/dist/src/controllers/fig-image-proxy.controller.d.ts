import { Response } from 'express';
import { FigImageProxyService } from '../services/fig-image-proxy.service';
export declare class FigImageProxyController {
    private readonly figImageProxyService;
    private readonly logger;
    constructor(figImageProxyService: FigImageProxyService);
    getFigImage(figId: string, res: Response, width?: number, height?: number, quality?: number): Promise<void>;
    getFigImageInfo(figId: string): Promise<{
        figId: string;
        imageUrl: string;
        proxyUrl: string;
        cached: boolean;
        contentType: any;
        contentLength: any;
        lastModified: any;
    }>;
    preloadImages(body: {
        figIds: string[];
    }): Promise<{
        message: string;
        total: number;
        success: number;
        failed: number;
    }>;
    clearImageCache(): Promise<void>;
    clearSpecificImageCache(figId: string): Promise<void>;
    getCacheStats(): Promise<{
        message: string;
        cacheType: string;
        ttl: number;
    }>;
}
