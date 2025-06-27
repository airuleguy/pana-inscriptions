import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Gymnast } from '../entities/gymnast.entity';
import { Choreography } from '../entities/choreography.entity';

export const databaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [Gymnast, Choreography],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  retryAttempts: 3,
  retryDelay: 3000,
}); 