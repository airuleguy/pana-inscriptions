import { GymnastService } from '../services/gymnast.service';
import { GymnastDto } from '../dto/gymnast.dto';
import { CreateGymnastDto } from '../dto/create-gymnast.dto';
import { UpdateGymnastDto } from '../dto/update-gymnast.dto';
export declare class GymnastController {
    private readonly gymnastService;
    constructor(gymnastService: GymnastService);
    findAll(country?: string): Promise<GymnastDto[]>;
    findOne(figId: string): Promise<GymnastDto | null>;
    clearCache(): Promise<void>;
    create(createGymnastDto: CreateGymnastDto): Promise<GymnastDto>;
    update(id: string, updateGymnastDto: UpdateGymnastDto): Promise<GymnastDto>;
    remove(id: string): Promise<void>;
}
