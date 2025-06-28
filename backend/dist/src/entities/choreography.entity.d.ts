import { Gymnast } from './gymnast.entity';
import { ITournament } from './types/tournament.interface';
export declare enum ChoreographyCategory {
    YOUTH = "YOUTH",
    JUNIOR = "JUNIOR",
    SENIOR = "SENIOR"
}
export declare enum ChoreographyType {
    MIND = "MIND",
    WIND = "WIND",
    MXP = "MXP",
    TRIO = "TRIO",
    GRP = "GRP",
    DNCE = "DNCE"
}
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
