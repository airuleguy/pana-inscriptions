import { ChoreographyService } from './choreography.service';
import { CoachRegistrationService } from './coach-registration.service';
import { JudgeRegistrationService } from './judge-registration.service';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
export declare class BatchRegistrationService {
    private readonly choreographyService;
    private readonly coachRegistrationService;
    private readonly judgeRegistrationService;
    private readonly logger;
    constructor(choreographyService: ChoreographyService, coachRegistrationService: CoachRegistrationService, judgeRegistrationService: JudgeRegistrationService);
    getExistingRegistrations(country: string, tournamentId: string): Promise<{
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
    getRegistrationSummary(country: string, tournamentId: string): Promise<{
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
    processBatchRegistration(batchDto: BatchRegistrationDto): Promise<BatchRegistrationResponseDto>;
    getTournamentStats(tournamentId: string): Promise<{
        choreographies: number;
        coaches: number;
        judges: number;
        total: number;
    }>;
}
