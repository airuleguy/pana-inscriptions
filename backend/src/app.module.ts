import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseConfig } from './config/database.config';
import { Gymnast } from './entities/gymnast.entity';
import { Choreography } from './entities/choreography.entity';
import { ChoreographyController } from './controllers/choreography.controller';
import { GymnastController } from './controllers/gymnast.controller';
import { HealthController } from './modules/health/health.controller';
import { ChoreographyService } from './services/choreography.service';
import { FigApiService } from './services/fig-api.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    
    // Entity repositories
    TypeOrmModule.forFeature([Gymnast, Choreography]),
    
    // Cache for FIG API
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [
    ChoreographyController,
    GymnastController,
    HealthController,
  ],
  providers: [
    ChoreographyService,
    FigApiService,
  ],
})
export class AppModule {} 