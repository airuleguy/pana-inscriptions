import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { GymnastDto } from '../dto/gymnast.dto';
import { CoachDto } from '../dto/coach.dto';
export declare class FigApiService {
    private readonly configService;
    private cacheManager;
    private readonly logger;
    private readonly figApiUrl;
    private readonly figCoachApiUrl;
    private readonly CACHE_KEY;
    private readonly COACH_CACHE_KEY;
    private readonly CACHE_TTL;
    constructor(configService: ConfigService, cacheManager: Cache);
    getGymnasts(): Promise<GymnastDto[]>;
    getGymnastsByCountry(country: string): Promise<GymnastDto[]>;
    getGymnastByFigId(figId: string): Promise<GymnastDto | null>;
    clearCache(): Promise<void>;
    getCoaches(): Promise<CoachDto[]>;
    getCoachesByCountry(country: string): Promise<CoachDto[]>;
    getCoachById(id: string): Promise<CoachDto | null>;
    clearCoachCache(): Promise<void>;
}
