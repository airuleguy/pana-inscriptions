import { JudgeRegistrationService } from '../services/judge-registration.service';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';
import { Judge } from '../entities/judge.entity';
export declare class JudgeRegistrationController {
    private readonly judgeRegistrationService;
    private readonly logger;
    constructor(judgeRegistrationService: JudgeRegistrationService);
    register(registrationData: CreateJudgeRegistrationDto | CreateJudgeRegistrationDto[]): Promise<{
        success: boolean;
        results: Judge[];
        errors?: string[];
    }>;
    findAll(country?: string, tournamentId?: string): Promise<Judge[]>;
    findOne(id: string): Promise<Judge>;
    update(id: string, updateData: Partial<CreateJudgeRegistrationDto>): Promise<Judge>;
    remove(id: string): Promise<void>;
    getCountryStats(country: string): Promise<{
        totalJudges: number;
        byTournament: Record<string, number>;
        byCategory: Record<string, number>;
    }>;
}
