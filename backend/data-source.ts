import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Gymnast } from './src/entities/gymnast.entity';
import { Choreography } from './src/entities/choreography.entity';
import { Tournament } from './src/entities/tournament.entity';
import { Coach } from './src/entities/coach.entity';
import { Judge } from './src/entities/judge.entity';
import { User } from './src/entities/user.entity';
import { UserSession } from './src/entities/user-session.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Gymnast, Choreography, Tournament, Coach, Judge, User, UserSession],
  migrations: ['src/migrations/*.ts'],
  migrationsRun: false,
  migrationsTableName: 'migrations',
  synchronize: false, // Always false for migrations
  logging: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}); 