import { FigApiService } from '../services/fig-api.service';
import { GymnastDto } from '../dto/gymnast.dto';
export declare class GymnastController {
    private readonly figApiService;
    constructor(figApiService: FigApiService);
    findAll(country?: string): Promise<GymnastDto[]>;
    findOne(figId: string): Promise<GymnastDto | null>;
    clearCache(): Promise<void>;
}
