import { Gymnast } from '../entities/gymnast.entity';
import { Choreography } from '../entities/choreography.entity';
import { Tournament } from '../entities/tournament.entity';
import { Coach } from '../entities/coach.entity';
import { Judge } from '../entities/judge.entity';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { SupportStaff } from '../entities/support.entity';

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
    entities: [Gymnast, Choreography, Tournament, Coach, Judge, SupportStaff, User, UserSession],
    synchronize: true, // Temporarily enabled to add isLocal column
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
    ttl: parseInt(process.env.CACHE_TTL, 10) || 43200, // 12 hours (matches refresh cycle)
    max: parseInt(process.env.CACHE_MAX, 10) || 1000,   // Increased limit for more data
  },
  
  imageCache: {
    ttl: parseInt(process.env.IMAGE_CACHE_TTL, 10) || 86400, // 24 hours
    max: parseInt(process.env.IMAGE_CACHE_MAX, 10) || 100,
  },

  figDataWarmup: {
    enabled: process.env.FIG_WARMUP_ENABLED !== 'false', // Default enabled
    imagePreloadLimit: parseInt(process.env.IMAGE_PRELOAD_LIMIT, 10) || 50,
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  storage: {
    useLocal: process.env.USE_LOCAL_STORAGE === 'true',
  },
}); 