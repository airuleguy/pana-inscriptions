import { CoachRegistrationService } from '../services/coach-registration.service';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { Coach } from '../entities/coach.entity';
export declare class CoachRegistrationController {
    private readonly coachRegistrationService;
    private readonly logger;
    constructor(coachRegistrationService: CoachRegistrationService);
    register(registrationData: CreateCoachRegistrationDto | CreateCoachRegistrationDto[]): Promise<{
        success: boolean;
        results: Coach[];
        errors?: string[];
    }>;
    findAll(country?: string, tournamentId?: string): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, updateData: Partial<CreateCoachRegistrationDto>): Promise<Coach>;
    remove(id: string): Promise<void>;
    getCountryStats(country: string): Promise<{
        totalCoaches: number;
        byTournament: Record<string, number>;
    }>;
}
