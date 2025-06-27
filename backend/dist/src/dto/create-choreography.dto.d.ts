import { ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';
export declare class CreateChoreographyDto {
    name: string;
    country: string;
    category: ChoreographyCategory;
    type: ChoreographyType;
    gymnastCount: number;
    oldestGymnastAge: number;
    gymnastFigIds: string[];
    notes?: string;
}
