"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const gymnast_entity_1 = require("../entities/gymnast.entity");
const choreography_entity_1 = require("../entities/choreography.entity");
const tournament_entity_1 = require("../entities/tournament.entity");
const coach_entity_1 = require("../entities/coach.entity");
const judge_entity_1 = require("../entities/judge.entity");
const user_entity_1 = require("../entities/user.entity");
const user_session_entity_1 = require("../entities/user-session.entity");
const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [gymnast_entity_1.Gymnast, choreography_entity_1.Choreography, tournament_entity_1.Tournament, coach_entity_1.Coach, judge_entity_1.Judge, user_entity_1.User, user_session_entity_1.UserSession],
        synchronize: true,
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
    imageCache: {
        ttl: parseInt(process.env.IMAGE_CACHE_TTL, 10) || 86400,
        maxSize: parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5 * 1024 * 1024,
    },
});
exports.configuration = configuration;
//# sourceMappingURL=config.js.map