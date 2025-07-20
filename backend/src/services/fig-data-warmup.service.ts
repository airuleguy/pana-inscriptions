import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FigApiService } from './fig-api.service';
import { FigImageProxyService } from './fig-image-proxy.service';

@Injectable()
export class FigDataWarmupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FigDataWarmupService.name);
  private isWarmedUp = false;
  private lastWarmupTime: Date | null = null;
  private warmupStats = {
    gymnasts: 0,
    coaches: 0,
    judges: 0,
    images: { success: 0, failed: 0 },
  };

  constructor(
    private readonly figApiService: FigApiService,
    private readonly figImageProxyService: FigImageProxyService,
  ) {}

  /**
   * Warm up cache on application startup
   */
  async onApplicationBootstrap() {
    this.logger.log('🔥 Starting FIG data warmup on application bootstrap...');
    await this.warmupFigData();
  }

  /**
   * Refresh cache every 12 hours
   */
  @Cron('0 */12 * * *') // Every 12 hours at minute 0
  async scheduledWarmup() {
    this.logger.log('⏰ Starting scheduled FIG data refresh...');
    await this.warmupFigData();
  }

  /**
   * Main warmup process
   */
  private async warmupFigData(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('📊 Warming up FIG data cache...');

    try {
      // Step 1: Load all gymnasts (this will cache them)
      const gymnasts = await this.figApiService.getGymnasts();
      this.warmupStats.gymnasts = gymnasts.length;
      this.logger.log(`✅ Cached ${gymnasts.length} gymnasts`);

      // Step 2: Load all coaches
      const coaches = await this.figApiService.getCoaches();
      this.warmupStats.coaches = coaches.length;
      this.logger.log(`✅ Cached ${coaches.length} coaches`);

      // Step 3: Load all judges
      const judges = await this.figApiService.getJudges();
      this.warmupStats.judges = judges.length;
      this.logger.log(`✅ Cached ${judges.length} judges`);

      // Step 4: Preload high-priority images (optional, can be async)
      await this.preloadCriticalImages([...gymnasts, ...coaches, ...judges]);

      this.isWarmedUp = true;
      this.lastWarmupTime = new Date();
      
      const duration = Date.now() - startTime;
      this.logger.log(`🎉 FIG data warmup completed in ${duration}ms`);
    } catch (error) {
      this.logger.error('❌ FIG data warmup failed:', error.message);
      // Don't throw - let application continue with on-demand loading
    }
  }

  /**
   * Preload images for people we're likely to need soon
   */
  private async preloadCriticalImages(people: Array<{ id: string; figId?: string }>): Promise<void> {
    // Extract FIG IDs that have valid image URLs
    const figIds = people
      .filter(person => person.figId && person.figId.trim() !== '')
      .map(person => person.figId)
      .slice(0, 50); // Limit to first 50 to avoid overwhelming FIG API

    if (figIds.length === 0) {
      this.logger.log('No FIG IDs found for image preloading');
      return;
    }

    this.logger.log(`🖼️  Preloading ${figIds.length} critical images...`);
    const imageStats = await this.figImageProxyService.preloadImages(figIds);
    this.warmupStats.images = imageStats;
    this.logger.log(`🖼️  Image preload: ${imageStats.success} success, ${imageStats.failed} failed`);
  }

  /**
   * Manual warmup trigger (useful for admin endpoints)
   */
  async triggerManualWarmup(): Promise<{
    message: string;
    stats: typeof this.warmupStats;
    duration: number;
  }> {
    const startTime = Date.now();
    await this.warmupFigData();
    const duration = Date.now() - startTime;
    
    return {
      message: 'Manual warmup completed',
      stats: this.warmupStats,
      duration,
    };
  }

  /**
   * Get warmup status for health checks
   */
  getWarmupStatus(): {
    isWarmedUp: boolean;
    lastWarmupTime: Date | null;
    stats: typeof this.warmupStats;
    nextScheduledWarmup: string;
  } {
    return {
      isWarmedUp: this.isWarmedUp,
      lastWarmupTime: this.lastWarmupTime,
      stats: this.warmupStats,
      nextScheduledWarmup: 'Every 12 hours',
    };
  }

  /**
   * Clear all FIG caches and reset warmup status
   */
  async clearAllCaches(): Promise<{
    message: string;
    clearedAt: Date;
  }> {
    await this.figApiService.clearAllCaches();
    await this.figImageProxyService.clearImageCache?.(); // Optional since method might not exist
    
    this.isWarmedUp = false;
    this.lastWarmupTime = null;
    this.warmupStats = {
      gymnasts: 0,
      coaches: 0,
      judges: 0,
      images: { success: 0, failed: 0 },
    };

    this.logger.log('🧹 All FIG caches cleared, warmup status reset');
    
    return {
      message: 'All caches cleared successfully',
      clearedAt: new Date(),
    };
  }
} 