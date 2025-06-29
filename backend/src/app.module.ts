import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseConfig } from './config/database.config';
import { Gymnast } from './entities/gymnast.entity';
import { Choreography } from './entities/choreography.entity';
import { Tournament } from './entities/tournament.entity';
import { Coach } from './entities/coach.entity';
import { Judge } from './entities/judge.entity';
import { ChoreographyController } from './controllers/choreography.controller';
import { GymnastController } from './controllers/gymnast.controller';
import { TournamentController } from './controllers/tournament.controller';
import { CoachController } from './controllers/coach.controller';
import { JudgeController } from './controllers/judge.controller';
import { TournamentRegistrationsController } from './controllers/tournament-registrations.controller';
import { GlobalRegistrationsController } from './controllers/registrations.controller';
import { HealthController } from './modules/health/health.controller';
import { ChoreographyService } from './services/choreography.service';
import { TournamentService } from './services/tournament.service';
import { CoachRegistrationService } from './services/coach-registration.service';
import { JudgeRegistrationService } from './services/judge-registration.service';
import { BatchRegistrationService } from './services/batch-registration.service';
import { FigApiService } from './services/fig-api.service';
import { BusinessRulesFactory } from './utils/business-rules/business-rules-factory';

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
    TypeOrmModule.forFeature([Gymnast, Choreography, Tournament, Coach, Judge]),
    
    // Cache for FIG API
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [
    // Core resource controllers
    ChoreographyController,
    GymnastController,
    TournamentController,
    CoachController,
    JudgeController,
    
    // Tournament-centric registrations (primary)
    TournamentRegistrationsController,
    
    // Global cross-tournament operations
    GlobalRegistrationsController,
    
    // Health check
    HealthController,
  ],
  providers: [
    ChoreographyService,
    TournamentService,
    CoachRegistrationService,
    JudgeRegistrationService,
    BatchRegistrationService,
    FigApiService,
    BusinessRulesFactory,
  ],
})
export class AppModule {}
