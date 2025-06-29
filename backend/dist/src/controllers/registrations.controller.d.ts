import { CoachRegistrationService } from '../services/coach-registration.service';
import { JudgeRegistrationService } from '../services/judge-registration.service';
import { ChoreographyService } from '../services/choreography.service';
export declare class GlobalRegistrationsController {
    private readonly coachRegistrationService;
    private readonly judgeRegistrationService;
    private readonly choreographyService;
    private readonly logger;
    constructor(coachRegistrationService: CoachRegistrationService, judgeRegistrationService: JudgeRegistrationService, choreographyService: ChoreographyService);
    getAllJudgeRegistrations(country?: string, tournamentId?: string, category?: string): Promise<import("../entities/judge.entity").Judge[]>;
    getAllCoachRegistrations(country?: string, tournamentId?: string, level?: string): Promise<import("../entities/coach.entity").Coach[]>;
    getAllChoreographyRegistrations(country?: string, category?: string, type?: string): Promise<import("../entities/choreography.entity").Choreography[]>;
    getGlobalRegistrationSummary(country?: string): Promise<{
        totals: {
            judges: number;
            coaches: number;
            choreographies: number;
        };
        byTournament: {};
    }>;
}
