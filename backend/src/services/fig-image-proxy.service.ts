import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios';
import { FigImageUtil } from '../utils/fig-image.util';

export interface CachedImageData {
  data: Buffer;
  contentType: string;
  contentLength: number;
  lastModified: string;
  etag?: string;
}

@Injectable()
export class FigImageProxyService {
  private readonly logger = new Logger(FigImageProxyService.name);
  private readonly IMAGE_CACHE_KEY_PREFIX = 'fig-image';
  private readonly IMAGE_CACHE_TTL: number;
  private readonly API_TIMEOUT: number;
  private readonly MAX_IMAGE_SIZE: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const cacheConfig = this.configService.get('cache');
    const figApiConfig = this.configService.get('figApi');
    
    // Extended cache time for images (24 hours) since they rarely change
    this.IMAGE_CACHE_TTL = parseInt(process.env.IMAGE_CACHE_TTL, 10) || 86400; // 24 hours
    this.API_TIMEOUT = figApiConfig.timeout || 30000;
    this.MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5 * 1024 * 1024; // 5MB
  }

  /**
   * Get FIG image by ID with caching and optimization
   */
  async getImage(figId: string): Promise<CachedImageData> {
    if (!figId || figId.trim() === '') {
      throw new HttpException('FIG ID is required', HttpStatus.BAD_REQUEST);
    }

    const cleanFigId = figId.trim();
    const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-${cleanFigId}`;

    try {
      // Try to get from cache first
      const cachedImage = await this.cacheManager.get<CachedImageData>(cacheKey);
      if (cachedImage) {
        this.logger.debug(`Returning cached image for FIG ID: ${cleanFigId}`);
        return cachedImage;
      }

      // Generate FIG image URL
      const imageUrl = FigImageUtil.generateImageUrl(cleanFigId);
      if (!imageUrl) {
        throw new HttpException('Invalid FIG ID format', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Fetching image from FIG for ID: ${cleanFigId}`);

      // Fetch image from FIG API
      const response: AxiosResponse<Buffer> = await axios.get(imageUrl, {
        timeout: this.API_TIMEOUT,
        responseType: 'arraybuffer',
        maxContentLength: this.MAX_IMAGE_SIZE,
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'PanamericanGymnastics/1.0',
        },
      });

      // Validate response
      if (response.status !== 200) {
        throw new HttpException(`FIG API returned status ${response.status}`, HttpStatus.BAD_GATEWAY);
      }

      if (!response.data || response.data.length === 0) {
        throw new HttpException('Empty image data received from FIG', HttpStatus.BAD_GATEWAY);
      }

      // Determine content type
      const contentType = response.headers['content-type'] || 'image/jpeg';
      
      // Validate it's actually an image
      if (!contentType.startsWith('image/')) {
        this.logger.warn(`Non-image content type received for FIG ID ${cleanFigId}: ${contentType}`);
        throw new HttpException('Invalid image format received from FIG', HttpStatus.BAD_GATEWAY);
      }

      const imageData: CachedImageData = {
        data: Buffer.from(response.data),
        contentType,
        contentLength: response.data.length,
        lastModified: response.headers['last-modified'] || new Date().toISOString(),
        etag: response.headers['etag'],
      };

      // Cache the image data (TTL in milliseconds for cache-manager v5)
      await this.cacheManager.set(cacheKey, imageData, this.IMAGE_CACHE_TTL * 1000);
      this.logger.log(`Cached image for FIG ID: ${cleanFigId} (${imageData.contentLength} bytes)`);

      return imageData;
    } catch (error) {
      this.logger.error(`Failed to fetch image for FIG ID: ${cleanFigId}`, error.message);
      
      if (error.response?.status === 404) {
        throw new HttpException('Image not found for this FIG ID', HttpStatus.NOT_FOUND);
      }
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('Image fetch timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      if (error.code === 'MAXCONTENTLENGTH') {
        throw new HttpException('Image too large', HttpStatus.PAYLOAD_TOO_LARGE);
      }

      // Return placeholder/fallback for other errors
      throw new HttpException('Failed to fetch image', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get optimized image with resize options
   */
  async getOptimizedImage(
    figId: string, 
    width?: number, 
    height?: number, 
    quality?: number
  ): Promise<CachedImageData> {
    // For now, return the original image
    // In the future, you could add image processing with Sharp or similar
    const originalImage = await this.getImage(figId);
    
    // TODO: Implement image resizing/optimization with Sharp
    // const optimizedBuffer = await this.resizeImage(originalImage.data, width, height, quality);
    
    return originalImage;
  }

  /**
   * Check if image exists in cache
   */
  async isImageCached(figId: string): Promise<boolean> {
    const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-${figId.trim()}`;
    const cached = await this.cacheManager.get(cacheKey);
    return cached !== undefined;
  }

  /**
   * Preload/warmup cache for multiple FIG IDs
   */
  async preloadImages(figIds: string[]): Promise<{ success: number; failed: number }> {
    this.logger.log(`Preloading ${figIds.length} images`);
    
    let success = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the FIG API
    const batchSize = 5;
    for (let i = 0; i < figIds.length; i += batchSize) {
      const batch = figIds.slice(i, i + batchSize);
      
      const promises = batch.map(async (figId) => {
        try {
          await this.getImage(figId);
          success++;
        } catch (error) {
          this.logger.warn(`Failed to preload image for FIG ID: ${figId}`, error.message);
          failed++;
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches to be respectful to FIG API
      if (i + batchSize < figIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.logger.log(`Image preload completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Clear image cache for specific FIG ID or all images
   */
  async clearImageCache(figId?: string): Promise<void> {
    if (figId) {
      const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-${figId.trim()}`;
      await this.cacheManager.del(cacheKey);
      this.logger.log(`Cleared image cache for FIG ID: ${figId}`);
    } else {
      // Clear all image cache (this would require implementing a pattern-based delete)
      this.logger.log('Image cache cleared (specific implementation needed for pattern deletion)');
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    message: string;
    cacheType: string;
    ttl: number;
  }> {
    return {
      message: 'FIG Image Proxy Cache Active',
      cacheType: 'In-Memory with 24h TTL',
      ttl: this.IMAGE_CACHE_TTL,
    };
  }
} 