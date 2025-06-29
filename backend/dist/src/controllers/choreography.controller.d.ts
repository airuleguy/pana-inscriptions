import { ChoreographyService } from '../services/choreography.service';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { UpdateChoreographyDto } from '../dto/update-choreography.dto';
import { Choreography } from '../entities/choreography.entity';
export declare class ChoreographyController {
    private readonly choreographyService;
    constructor(choreographyService: ChoreographyService);
    create(createChoreographyDto: CreateChoreographyDto): Promise<Choreography>;
    findAll(country?: string): Promise<Choreography[]>;
    findOne(id: string): Promise<Choreography>;
    update(id: string, updateChoreographyDto: UpdateChoreographyDto): Promise<Choreography>;
    remove(id: string): Promise<void>;
    getCountryStats(country: string): Promise<{
        totalChoreographies: number;
        byCategory: Record<import("../constants/categories").ChoreographyCategory, number>;
    }>;
}
