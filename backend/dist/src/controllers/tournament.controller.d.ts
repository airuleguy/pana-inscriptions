import { TournamentService } from '../services/tournament.service';
import { BatchRegistrationService } from '../services/batch-registration.service';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { Tournament, TournamentType } from '../entities/tournament.entity';
export declare class TournamentController {
    private readonly tournamentService;
    private readonly batchRegistrationService;
    private readonly logger;
    constructor(tournamentService: TournamentService, batchRegistrationService: BatchRegistrationService);
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
    getTournamentRegistrations(tournamentId: string, country?: string): Promise<{
        choreographies: number;
        coaches: number;
        judges: number;
        total: number;
    } | {
        choreographies: import("../entities/choreography.entity").Choreography[];
        coaches: import("../entities/coach.entity").Coach[];
        judges: import("../entities/judge.entity").Judge[];
        totals: {
            choreographies: number;
            coaches: number;
            judges: number;
            total: number;
        };
    }>;
    getTournamentRegistrationSummary(tournamentId: string, country: string): Promise<{
        summary: {
            country: string;
            tournamentId: string;
            lastUpdated: Date;
            registrationStatus: string;
        };
        choreographies: import("../entities/choreography.entity").Choreography[];
        coaches: import("../entities/coach.entity").Coach[];
        judges: import("../entities/judge.entity").Judge[];
        totals: {
            choreographies: number;
            coaches: number;
            judges: number;
            total: number;
        };
    }>;
    remove(id: string): Promise<void>;
}
