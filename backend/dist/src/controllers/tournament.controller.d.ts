import { TournamentService } from '../services/tournament.service';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { Tournament, TournamentType } from '../entities/tournament.entity';
export declare class TournamentController {
    private readonly tournamentService;
    constructor(tournamentService: TournamentService);
    create(createTournamentDto: CreateTournamentDto): Promise<Tournament>;
    findAll(activeOnly?: string): Promise<Tournament[]>;
    findByType(type: TournamentType): Promise<Tournament[]>;
    findOne(id: string): Promise<Tournament>;
    getTournamentStats(id: string): Promise<{
        totalChoreographies: number;
        choreographiesByCategory: Record<string, number>;
        choreographiesByType: Record<string, number>;
        countriesParticipating: string[];
    }>;
    update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<Tournament>;
    remove(id: string): Promise<void>;
}
