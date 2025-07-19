import { Gymnast } from '../entities/gymnast.entity';
import { Choreography } from '../entities/choreography.entity';
import { Tournament } from '../entities/tournament.entity';
import { Coach } from '../entities/coach.entity';
import { Judge } from '../entities/judge.entity';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
export declare const configuration: () => {
    port: number;
    nodeEnv: string;
    database: {
        type: "postgres";
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        entities: (typeof Tournament | typeof Choreography | typeof Gymnast | typeof Coach | typeof Judge | typeof UserSession | typeof User)[];
        synchronize: boolean;
        dropSchema: boolean;
        logging: boolean;
        ssl: boolean | {
            rejectUnauthorized: boolean;
        };
        retryAttempts: number;
        retryDelay: number;
    };
    jwt: {
        secret: string;
        signOptions: {
            expiresIn: string;
        };
    };
    figApi: {
        baseUrl: string;
        athletesEndpoint: string;
        coachesEndpoint: string;
        judgesEndpoint: string;
        timeout: number;
    };
    cache: {
        ttl: number;
        max: number;
    };
    imageCache: {
        ttl: number;
        maxSize: number;
    };
};
