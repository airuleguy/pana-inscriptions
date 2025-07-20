import { Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FigApiService } from '../../services/fig-api.service';
import { FigImageProxyService } from '../../services/fig-image-proxy.service';
import { FigDataWarmupService } from '../../services/fig-data-warmup.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly figApiService: FigApiService,
    private readonly figImageProxyService: FigImageProxyService,
    private readonly figDataWarmupService: FigDataWarmupService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Check if the API is running and responsive'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('cache')
  async getCacheHealth(): Promise<{
    status: string;
    figApi: any;
    images: any;
    warmup: any;
  }> {
    const [figStats, imageStats, warmupStatus] = await Promise.all([
      this.figApiService.getCacheStats(),
      this.figImageProxyService.getCacheStats(),
      this.figDataWarmupService.getWarmupStatus(),
    ]);

    return {
      status: 'ok',
      figApi: figStats,
      images: imageStats,
      warmup: warmupStatus,
    };
  }

  @Post('cache/warmup')
  async triggerCacheWarmup(): Promise<any> {
    return await this.figDataWarmupService.triggerManualWarmup();
  }

  @Post('cache/clear')
  @ApiOperation({ 
    summary: 'Clear all caches',
    description: 'Clear all FIG API and image caches, forcing fresh data on next request'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'All caches cleared successfully'
  })
  async clearAllCaches(): Promise<any> {
    return await this.figDataWarmupService.clearAllCaches();
  }
} 