import { Gymnast } from '../entities/gymnast.entity';
import { Choreography } from '../entities/choreography.entity';
import { Tournament } from '../entities/tournament.entity';
import { Coach } from '../entities/coach.entity';
import { Judge } from '../entities/judge.entity';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';

export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    type: 'postgres' as const,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [Gymnast, Choreography, Tournament, Coach, Judge, User, UserSession],
    synchronize: process.env.NODE_ENV !== 'production',
    dropSchema: false,
    logging: process.env.NODE_ENV !== 'production',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    retryAttempts: 3,
    retryDelay: 3000,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    },
  },
  
  figApi: {
    baseUrl: process.env.FIG_API_BASE_URL || 'https://www.gymnastics.sport/api',
    athletesEndpoint: process.env.FIG_API_ATHLETES_ENDPOINT || '/athletes.php',
    coachesEndpoint: process.env.FIG_API_COACHES_ENDPOINT || '/coaches.php',
    judgesEndpoint: process.env.FIG_API_JUDGES_ENDPOINT || '/judges.php',
    timeout: parseInt(process.env.FIG_API_TIMEOUT, 10) || 30000,
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 3600,
    max: parseInt(process.env.CACHE_MAX, 10) || 100,
  },
}); 