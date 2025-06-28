import { FigApiService } from '../services/fig-api.service';
import { CoachDto } from '../dto/coach.dto';
export declare class CoachController {
    private readonly figApiService;
    constructor(figApiService: FigApiService);
    findAll(country?: string): Promise<CoachDto[]>;
    findOne(id: string): Promise<CoachDto | null>;
    clearCache(): Promise<void>;
}
