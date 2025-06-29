import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { Tournament } from '../entities/tournament.entity';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { RegistrationStatus } from '../constants/registration-status';
export declare class CoachRegistrationService {
    private readonly coachRepository;
    private readonly tournamentRepository;
    constructor(coachRepository: Repository<Coach>, tournamentRepository: Repository<Tournament>);
    create(createCoachDto: CreateCoachRegistrationDto): Promise<Coach>;
    findAll(country?: string, tournamentId?: string): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, updateData: Partial<CreateCoachRegistrationDto>): Promise<Coach>;
    remove(id: string): Promise<void>;
    getCountryStats(country: string): Promise<{
        totalCoaches: number;
        byTournament: Record<string, number>;
    }>;
    findByStatus(status: RegistrationStatus, country?: string, tournamentId?: string): Promise<Coach[]>;
    updateStatus(id: string, status: RegistrationStatus, notes?: string): Promise<boolean>;
    updateStatusBatch(fromStatus: RegistrationStatus, toStatus: RegistrationStatus, country?: string, tournamentId?: string, notes?: string): Promise<number>;
}
