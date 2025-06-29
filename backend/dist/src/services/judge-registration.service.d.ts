import { Repository } from 'typeorm';
import { Judge } from '../entities/judge.entity';
import { Tournament } from '../entities/tournament.entity';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';
export declare class JudgeRegistrationService {
    private readonly judgeRepository;
    private readonly tournamentRepository;
    constructor(judgeRepository: Repository<Judge>, tournamentRepository: Repository<Tournament>);
    create(createJudgeDto: CreateJudgeRegistrationDto): Promise<Judge>;
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
