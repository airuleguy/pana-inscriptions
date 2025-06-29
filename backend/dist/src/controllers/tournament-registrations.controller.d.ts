import { CoachRegistrationService } from '../services/coach-registration.service';
import { JudgeRegistrationService } from '../services/judge-registration.service';
import { ChoreographyService } from '../services/choreography.service';
import { BatchRegistrationService } from '../services/batch-registration.service';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
import { Coach } from '../entities/coach.entity';
import { Judge } from '../entities/judge.entity';
import { Choreography } from '../entities/choreography.entity';
export declare class TournamentRegistrationsController {
    private readonly coachRegistrationService;
    private readonly judgeRegistrationService;
    private readonly choreographyService;
    private readonly batchRegistrationService;
    private readonly logger;
    constructor(coachRegistrationService: CoachRegistrationService, judgeRegistrationService: JudgeRegistrationService, choreographyService: ChoreographyService, batchRegistrationService: BatchRegistrationService);
    registerJudges(tournamentId: string, registrationData: CreateJudgeRegistrationDto | CreateJudgeRegistrationDto[]): Promise<{
        success: boolean;
        results: Judge[];
        errors?: string[];
    }>;
    getTournamentJudges(tournamentId: string, country?: string): Promise<Judge[]>;
    updateJudgeRegistration(tournamentId: string, judgeId: string, updateData: Partial<CreateJudgeRegistrationDto>): Promise<Judge>;
    removeJudgeRegistration(tournamentId: string, judgeId: string): Promise<void>;
    registerCoaches(tournamentId: string, registrationData: CreateCoachRegistrationDto | CreateCoachRegistrationDto[]): Promise<{
        success: boolean;
        results: Coach[];
        errors?: string[];
    }>;
    getTournamentCoaches(tournamentId: string, country?: string): Promise<Coach[]>;
    updateCoachRegistration(tournamentId: string, coachId: string, updateData: Partial<CreateCoachRegistrationDto>): Promise<Coach>;
    removeCoachRegistration(tournamentId: string, coachId: string): Promise<void>;
    registerChoreographies(tournamentId: string, registrationData: CreateChoreographyDto | CreateChoreographyDto[]): Promise<{
        success: boolean;
        results: Choreography[];
        errors?: string[];
    }>;
    getTournamentChoreographies(tournamentId: string, country?: string, category?: string, type?: string): Promise<Choreography[]>;
    updateChoreographyRegistration(tournamentId: string, choreographyId: string, updateData: Partial<CreateChoreographyDto>): Promise<Choreography>;
    removeChoreographyRegistration(tournamentId: string, choreographyId: string): Promise<void>;
    batchRegister(tournamentId: string, batchData: BatchRegistrationDto): Promise<BatchRegistrationResponseDto>;
    getTournamentRegistrationSummary(tournamentId: string, country?: string): Promise<{
        choreographies: number;
        coaches: number;
        judges: number;
        total: number;
    } | {
        summary: {
            country: string;
            tournamentId: string;
            lastUpdated: Date;
            registrationStatus: string;
        };
        choreographies: Choreography[];
        coaches: Coach[];
        judges: Judge[];
        totals: {
            choreographies: number;
            coaches: number;
            judges: number;
            total: number;
        };
    }>;
    getTournamentRegistrationStats(tournamentId: string): Promise<{
        choreographies: number;
        coaches: number;
        judges: number;
        total: number;
    }>;
}
