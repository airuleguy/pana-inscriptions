import { ChoreographyService } from './choreography.service';
import { CoachRegistrationService } from './coach-registration.service';
import { JudgeRegistrationService } from './judge-registration.service';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
import { RegistrationStatus } from '../constants/registration-status';
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
    getRegistrationsByStatus(country: string, tournamentId: string, status: RegistrationStatus): Promise<{
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
    submitAllPendingRegistrations(country: string, tournamentId: string, notes?: string): Promise<{
        success: boolean;
        updated: {
            choreographies: number;
            coaches: number;
            judges: number;
            total: number;
        };
        errors?: string[];
    }>;
    updateRegistrationsStatus(registrationIds: string[], status: RegistrationStatus, notes?: string): Promise<{
        success: boolean;
        updated: number;
        errors?: string[];
    }>;
}
