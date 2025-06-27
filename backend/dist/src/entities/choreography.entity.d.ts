import { Gymnast } from './gymnast.entity';
export declare enum ChoreographyCategory {
    YOUTH = "YOUTH",
    JUNIOR = "JUNIOR",
    SENIOR = "SENIOR"
}
export declare enum ChoreographyType {
    INDIVIDUAL = "Individual",
    MIXED_PAIR = "Mixed Pair",
    TRIO = "Trio",
    GROUP = "Group",
    PLATFORM = "Platform"
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
    gymnasts: Gymnast[];
    createdAt: Date;
    updatedAt: Date;
}
