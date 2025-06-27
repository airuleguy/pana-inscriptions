import { TournamentService } from '../services/tournament.service';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { TournamentType } from '../entities/tournament.entity';
export declare class TournamentController {
    private readonly tournamentService;
    constructor(tournamentService: TournamentService);
    create(createTournamentDto: CreateTournamentDto): Promise<import("../entities/tournament.entity").Tournament>;
    findAll(activeOnly?: string): Promise<import("../entities/tournament.entity").Tournament[]>;
    findByType(type: TournamentType): Promise<import("../entities/tournament.entity").Tournament[]>;
    findOne(id: string): Promise<import("../entities/tournament.entity").Tournament>;
    getTournamentStats(id: string): Promise<{
        totalChoreographies: number;
        choreographiesByCategory: Record<string, number>;
        choreographiesByType: Record<string, number>;
        countriesParticipating: string[];
    }>;
    update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<import("../entities/tournament.entity").Tournament>;
    remove(id: string): Promise<void>;
}
