import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { GymnastDto } from '../dto/gymnast.dto';
export declare class FigApiService {
    private readonly configService;
    private cacheManager;
    private readonly logger;
    private readonly figApiUrl;
    private readonly CACHE_KEY;
    private readonly CACHE_TTL;
    constructor(configService: ConfigService, cacheManager: Cache);
    getGymnasts(): Promise<GymnastDto[]>;
    getGymnastsByCountry(country: string): Promise<GymnastDto[]>;
    getGymnastByFigId(figId: string): Promise<GymnastDto | null>;
    clearCache(): Promise<void>;
}
