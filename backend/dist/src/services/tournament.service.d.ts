import { Repository } from 'typeorm';
import { Tournament, TournamentType } from '../entities/tournament.entity';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
export declare class TournamentService {
    private tournamentRepository;
    private readonly logger;
    constructor(tournamentRepository: Repository<Tournament>);
    create(createTournamentDto: CreateTournamentDto): Promise<Tournament>;
    findAll(): Promise<Tournament[]>;
    findActive(): Promise<Tournament[]>;
    findByType(type: TournamentType): Promise<Tournament[]>;
    findOne(id: string): Promise<Tournament>;
    update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<Tournament>;
    remove(id: string): Promise<void>;
    getTournamentStats(id: string): Promise<{
        totalChoreographies: number;
        choreographiesByCategory: Record<string, number>;
        choreographiesByType: Record<string, number>;
        countriesParticipating: string[];
    }>;
}
