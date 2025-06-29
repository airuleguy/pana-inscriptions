import { Gymnast } from './gymnast.entity';
import { ITournament } from './types/tournament.interface';
import { ChoreographyCategory, ChoreographyType } from '../constants/categories';
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
    tournament: ITournament;
    gymnasts: Gymnast[];
    createdAt: Date;
    updatedAt: Date;
}
