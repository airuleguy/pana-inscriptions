import { Repository } from 'typeorm';
import { Choreography, ChoreographyCategory } from '../entities/choreography.entity';
import { Gymnast } from '../entities/gymnast.entity';
import { Tournament } from '../entities/tournament.entity';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { UpdateChoreographyDto } from '../dto/update-choreography.dto';
import { FigApiService } from './fig-api.service';
import { GymnastService } from './gymnast.service';
import { BusinessRulesFactory } from '../utils/business-rules/business-rules-factory';
import { RegistrationStatus } from '../constants/registration-status';
export declare class ChoreographyService {
    private choreographyRepository;
    private gymnastRepository;
    private tournamentRepository;
    private figApiService;
    private gymnastService;
    private businessRulesFactory;
    private readonly logger;
    constructor(choreographyRepository: Repository<Choreography>, gymnastRepository: Repository<Gymnast>, tournamentRepository: Repository<Tournament>, figApiService: FigApiService, gymnastService: GymnastService, businessRulesFactory: BusinessRulesFactory);
    create(createChoreographyDto: CreateChoreographyDto): Promise<Choreography>;
    findAll(): Promise<Choreography[]>;
    findByCountry(country: string): Promise<Choreography[]>;
    findOne(id: string): Promise<Choreography>;
    update(id: string, updateChoreographyDto: UpdateChoreographyDto): Promise<Choreography>;
    remove(id: string): Promise<void>;
    private validateBusinessRules;
    private validateChoreographyType;
    private validateGymnastFigIds;
    private fetchAndValidateGymnasts;
    private upsertGymnasts;
    getCountryStats(country: string): Promise<{
        totalChoreographies: number;
        byCategory: Record<ChoreographyCategory, number>;
    }>;
    findByStatus(status: RegistrationStatus, country?: string, tournamentId?: string): Promise<Choreography[]>;
    updateStatus(id: string, status: RegistrationStatus, notes?: string): Promise<boolean>;
    updateStatusBatch(fromStatus: RegistrationStatus, toStatus: RegistrationStatus, country?: string, tournamentId?: string, notes?: string): Promise<number>;
}
