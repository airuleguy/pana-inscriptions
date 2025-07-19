import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  Res, 
  HttpStatus, 
  Logger, 
  Post, 
  Body,
  Delete,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { FigImageProxyService } from '../services/fig-image-proxy.service';

@ApiTags('images')
@Controller('images')
export class FigImageProxyController {
  private readonly logger = new Logger(FigImageProxyController.name);

  constructor(private readonly figImageProxyService: FigImageProxyService) {}

  @Get('fig/:figId')
  @ApiOperation({ 
    summary: 'Get FIG person image',
    description: 'Retrieve a cached and optimized image for a FIG person (athlete, coach, or judge)'
  })
  @ApiParam({ 
    name: 'figId', 
    description: 'FIG ID of the person', 
    example: '91998' 
  })
  @ApiQuery({ 
    name: 'width', 
    required: false, 
    description: 'Desired image width in pixels',
    example: 150 
  })
  @ApiQuery({ 
    name: 'height', 
    required: false, 
    description: 'Desired image height in pixels',
    example: 200 
  })
  @ApiQuery({ 
    name: 'quality', 
    required: false, 
    description: 'Image quality (1-100)',
    example: 85 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Image returned successfully',
    headers: {
      'Content-Type': { description: 'Image MIME type' },
      'Content-Length': { description: 'Image size in bytes' },
      'Cache-Control': { description: 'Client caching directive' },
      'ETag': { description: 'Entity tag for caching' },
    }
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Image not found for this FIG ID' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid FIG ID format' 
  })
  @ApiResponse({ 
    status: HttpStatus.TOO_MANY_REQUESTS, 
    description: 'FIG API rate limit exceeded' 
  })
  async getFigImage(
    @Param('figId') figId: string,
    @Res() res: Response,
    @Query('width') width?: number,
    @Query('height') height?: number,
    @Query('quality') quality?: number,
  ): Promise<void> {
    try {
      const imageData = await this.figImageProxyService.getOptimizedImage(
        figId, 
        width, 
        height, 
        quality
      );

      // Set appropriate headers for image serving and caching
      res.set({
        'Content-Type': imageData.contentType,
        'Content-Length': imageData.contentLength.toString(),
        'Last-Modified': imageData.lastModified,
        'Cache-Control': 'public, max-age=86400, immutable', // 24 hours client cache
        'ETag': imageData.etag || `"fig-${figId}-${imageData.contentLength}"`,
        'X-Content-Source': 'FIG-Proxy-Cache',
      });

      // Send the image data
      res.status(HttpStatus.OK).send(imageData.data);
      
      this.logger.debug(`Served image for FIG ID: ${figId} (${imageData.contentLength} bytes)`);
    } catch (error) {
      this.logger.error(`Error serving image for FIG ID: ${figId}`, error.message);
      
      // Let NestJS handle the HttpException properly
      throw error;
    }
  }

  @Get('fig/:figId/info')
  @ApiOperation({ 
    summary: 'Get FIG image information',
    description: 'Get metadata about a FIG image without downloading the actual image data'
  })
  @ApiParam({ 
    name: 'figId', 
    description: 'FIG ID of the person', 
    example: '91998' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
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
  })
  async getFigImageInfo(@Param('figId') figId: string) {
    const isImageCached = await this.figImageProxyService.isImageCached(figId);
    
    let imageData = null;
    if (isImageCached) {
      try {
        imageData = await this.figImageProxyService.getImage(figId);
      } catch (error) {
        // Image might be in cache but corrupted/expired
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

  @Post('preload')
  @ApiOperation({ 
    summary: 'Preload multiple FIG images',
    description: 'Warmup the cache by preloading images for multiple FIG IDs'
  })
  @ApiBody({
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
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
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
  })
  async preloadImages(@Body() body: { figIds: string[] }) {
    const { figIds } = body;
    const result = await this.figImageProxyService.preloadImages(figIds);
    
    return {
      message: 'Preload completed',
      total: figIds.length,
      success: result.success,
      failed: result.failed,
    };
  }

  @Delete('cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear image cache',
    description: 'Clear all cached FIG images to force fresh fetches'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Image cache cleared successfully'
  })
  async clearImageCache(): Promise<void> {
    await this.figImageProxyService.clearImageCache();
  }

  @Delete('cache/:figId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Clear specific image from cache',
    description: 'Clear cached image for a specific FIG ID'
  })
  @ApiParam({ 
    name: 'figId', 
    description: 'FIG ID of the person', 
    example: '91998' 
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Image cache cleared for specific FIG ID'
  })
  async clearSpecificImageCache(@Param('figId') figId: string): Promise<void> {
    await this.figImageProxyService.clearImageCache(figId);
  }

  @Get('cache/stats')
  @ApiOperation({ 
    summary: 'Get image cache statistics',
    description: 'Get information about the image cache status'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cache statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'FIG Image Proxy Cache Active' },
        cacheType: { type: 'string', example: 'In-Memory with 24h TTL' },
        ttl: { type: 'number', example: 86400 }
      }
    }
  })
  async getCacheStats() {
    return this.figImageProxyService.getCacheStats();
  }
} 