import { Gymnast } from './gymnast.entity';
import { ITournament } from './types/tournament.interface';
import { ChoreographyCategory, ChoreographyType } from '../constants/categories';
import { RegistrationStatus } from '../constants/registration-status';
export { ChoreographyCategory, ChoreographyType };
export declare class Choreography {
    id: string;
    name: string;
    country: string;
    category: ChoreographyCategory;
    type: ChoreographyType;
    gymnastCount: number;
    oldestGymnastAge: number;
    notes: string;
    status: RegistrationStatus;
    tournament: ITournament;
    gymnasts: Gymnast[];
    createdAt: Date;
    updatedAt: Date;
}
