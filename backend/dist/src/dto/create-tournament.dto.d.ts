import { TournamentType } from '../entities/tournament.entity';
export declare class CreateTournamentDto {
    name: string;
    shortName: string;
    type: TournamentType;
    description?: string;
    startDate: string;
    endDate: string;
    location: string;
    isActive?: boolean;
}
