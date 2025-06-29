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
    return this.configService.get('database');
  }
}

// Legacy function for backward compatibility
export const databaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
  const config = new DatabaseConfig(configService);
  return config.createTypeOrmOptions();
}; 