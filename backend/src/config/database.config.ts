import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Gymnast } from '../entities/gymnast.entity';
import { Choreography } from '../entities/choreography.entity';
import { Tournament } from '../entities/tournament.entity';
import { Coach } from '../entities/coach.entity';
import { Judge } from '../entities/judge.entity';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    
    return {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST') || 'localhost',
      port: this.configService.get<number>('POSTGRES_PORT') || 5432,
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB'),
      entities: [Gymnast, Choreography, Tournament, Coach, Judge, User, UserSession],
      synchronize: !isProduction, // Auto-create tables in development
      dropSchema: false, // Don't drop schema to preserve seeded data
      logging: !isProduction,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      retryAttempts: 3,
      retryDelay: 3000,
    };
  }
}

// Legacy function for backward compatibility
export const databaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
  const config = new DatabaseConfig(configService);
  return config.createTypeOrmOptions();
}; 