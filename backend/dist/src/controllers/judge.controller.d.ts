import { FigApiService } from '../services/fig-api.service';
import { JudgeDto } from '../dto/judge.dto';
export declare class JudgeController {
    private readonly figApiService;
    constructor(figApiService: FigApiService);
    findAll(country?: string): Promise<JudgeDto[]>;
    findOne(id: string): Promise<JudgeDto | null>;
    clearCache(): Promise<void>;
}
