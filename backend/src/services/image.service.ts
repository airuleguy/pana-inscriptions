import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FigImageProxyService } from './fig-image-proxy.service';
import { StorageFactory } from './storage.factory';
import { Gymnast } from '../entities/gymnast.entity';

export interface ImageData {
  data: Buffer;
  contentType: string;
  contentLength: number;
  lastModified: string;
  etag?: string;
}

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private readonly IMAGE_CACHE_KEY_PREFIX = 'image';
  private readonly IMAGE_CACHE_TTL: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly figImageProxyService: FigImageProxyService,
    private readonly storageFactory: StorageFactory,
    @InjectRepository(Gymnast)
    private readonly gymnastRepository: Repository<Gymnast>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.IMAGE_CACHE_TTL = parseInt(process.env.IMAGE_CACHE_TTL, 10) || 86400; // 24 hours
  }

  /**
   * Get gymnast image based on ID
   * @param id The ID of the gymnast (FIG ID or entity ID)
   */
  async getGymnastImage(id: string, width?: number, height?: number, quality?: number): Promise<ImageData> {
    if (!id || id.trim() === '') {
      throw new HttpException('Gymnast ID is required', HttpStatus.BAD_REQUEST);
    }

    const cleanId = id.trim();
    const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-gymnast-${cleanId}`;

    try {
      // Try to get from cache first
      const cachedImage = await this.cacheManager.get<ImageData>(cacheKey);
      if (cachedImage) {
        this.logger.debug(`Returning cached image for gymnast: ${cleanId}`);
        return cachedImage;
      }

      // First, try to find a local gymnast
      let gymnast = null;

      // Try to find by UUID first (for local gymnasts)
      if (cleanId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        gymnast = await this.gymnastRepository.findOne({ 
          where: { id: cleanId }
        });
      }

      // If not found and not a UUID, try by FIG ID
      if (!gymnast) {
        gymnast = await this.gymnastRepository.findOne({
          where: { figId: cleanId }
        });
      }

      let imageData: ImageData;

      if (gymnast?.isLocal && gymnast.imageUrl) {
        // Get image from S3/local storage for local gymnasts
        const storage = this.storageFactory.getStorage();
        const buffer = await storage.getFile(gymnast.imageUrl);
        
        if (!buffer) {
          throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
        }

        imageData = {
          data: buffer,
          contentType: this.getContentType(buffer),
          contentLength: buffer.length,
          lastModified: new Date().toISOString(),
        };
      } else {
        // Get image from FIG API for FIG gymnasts or local gymnasts without uploaded images
        const figImage = await this.figImageProxyService.getImage(gymnast?.figId || cleanId);
        imageData = {
          data: figImage.data,
          contentType: figImage.contentType,
          contentLength: figImage.contentLength,
          lastModified: figImage.lastModified,
          etag: figImage.etag,
        };
      }

      // Cache the image data
      await this.cacheManager.set(cacheKey, imageData, this.IMAGE_CACHE_TTL * 1000);
      this.logger.log(`Cached image for gymnast: ${cleanId} (${imageData.contentLength} bytes)`);

      return imageData;
    } catch (error) {
      this.logger.error(`Failed to fetch image for gymnast: ${cleanId}`, error.message);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Failed to fetch image', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get optimized image with resize options
   */
  async getOptimizedImage(
    id: string,
    width?: number,
    height?: number,
    quality?: number
  ): Promise<ImageData> {
    // For now, return the original image
    // In the future, you could add image processing with Sharp or similar
    return this.getGymnastImage(id, width, height, quality);
  }

  /**
   * Clear image cache for specific ID or all images
   */
  async clearImageCache(id?: string): Promise<void> {
    if (id) {
      const cacheKey = `${this.IMAGE_CACHE_KEY_PREFIX}-gymnast-${id.trim()}`;
      await this.cacheManager.del(cacheKey);
      this.logger.log(`Cleared image cache for gymnast: ${id}`);
    } else {
      // Clear all image cache
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
      message: 'Image Service Cache Active',
      cacheType: 'In-Memory with 24h TTL',
      ttl: this.IMAGE_CACHE_TTL,
    };
  }

  /**
   * Determine content type from buffer
   */
  private getContentType(buffer: Buffer): string {
    // Simple magic number check for common image formats
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image/jpeg';
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      return 'image/png';
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49) {
      return 'image/gif';
    }
    return 'application/octet-stream';
  }
}
