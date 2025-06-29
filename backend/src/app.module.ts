import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseConfig } from './config/database.config';
import { Gymnast } from './entities/gymnast.entity';
import { Choreography } from './entities/choreography.entity';
import { Tournament } from './entities/tournament.entity';
import { Coach } from './entities/coach.entity';
import { Judge } from './entities/judge.entity';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { ChoreographyController } from './controllers/choreography.controller';
import { GymnastController } from './controllers/gymnast.controller';
import { TournamentController } from './controllers/tournament.controller';
import { CoachController } from './controllers/coach.controller';
import { JudgeController } from './controllers/judge.controller';
import { TournamentRegistrationsController } from './controllers/tournament-registrations.controller';
import { GlobalRegistrationsController } from './controllers/registrations.controller';
import { HealthController } from './modules/health/health.controller';
import { AuthController } from './controllers/auth.controller';
import { ChoreographyService } from './services/choreography.service';
import { TournamentService } from './services/tournament.service';
import { CoachRegistrationService } from './services/coach-registration.service';
import { JudgeRegistrationService } from './services/judge-registration.service';
import { BatchRegistrationService } from './services/batch-registration.service';
import { FigApiService } from './services/fig-api.service';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { AuthGuard } from './guards/auth.guard';
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
    TypeOrmModule.forFeature([Gymnast, Choreography, Tournament, Coach, Judge, User, UserSession]),
    
    // JWT Module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key-change-in-production',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '30d',
        },
      }),
      inject: [ConfigService],
    }),
    
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
    
    // Authentication
    AuthController,
    
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
    AuthService,
    JwtService,
    AuthGuard,
    BusinessRulesFactory,
  ],
})
export class AppModule {}
