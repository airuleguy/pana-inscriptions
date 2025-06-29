import { Request } from 'express';
import { CoachRegistrationService } from '../services/coach-registration.service';
import { JudgeRegistrationService } from '../services/judge-registration.service';
import { ChoreographyService } from '../services/choreography.service';
export declare class GlobalRegistrationsController {
    private readonly coachRegistrationService;
    private readonly judgeRegistrationService;
    private readonly choreographyService;
    private readonly logger;
    constructor(coachRegistrationService: CoachRegistrationService, judgeRegistrationService: JudgeRegistrationService, choreographyService: ChoreographyService);
    getAllJudgeRegistrations(request: Request, tournamentId?: string, category?: string): Promise<import("../entities/judge.entity").Judge[]>;
    getAllCoachRegistrations(request: Request, tournamentId?: string, level?: string): Promise<import("../entities/coach.entity").Coach[]>;
    getAllChoreographyRegistrations(request: Request, category?: string, type?: string): Promise<import("../entities/choreography.entity").Choreography[]>;
    getGlobalRegistrationSummary(request: Request): Promise<{
        totals: {
            judges: number;
            coaches: number;
            choreographies: number;
        };
        byTournament: {};
    }>;
}
