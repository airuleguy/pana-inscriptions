import { Repository } from 'typeorm';
import { Gymnast } from '../entities/gymnast.entity';
import { FigApiService } from './fig-api.service';
import { GymnastDto } from '../dto/gymnast.dto';
import { CreateGymnastDto } from '../dto/create-gymnast.dto';
import { UpdateGymnastDto } from '../dto/update-gymnast.dto';
export declare class GymnastService {
    private gymnastRepository;
    private figApiService;
    private readonly logger;
    constructor(gymnastRepository: Repository<Gymnast>, figApiService: FigApiService);
    findAll(country?: string): Promise<GymnastDto[]>;
    findByFigId(figId: string): Promise<GymnastDto | null>;
    create(createGymnastDto: CreateGymnastDto): Promise<GymnastDto>;
    update(id: string, updateGymnastDto: UpdateGymnastDto): Promise<GymnastDto>;
    remove(id: string): Promise<void>;
    private getLocalGymnasts;
    private transformEntityToDto;
    private calculateAge;
    private calculateCategory;
    clearCache(): Promise<void>;
}
