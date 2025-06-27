import { ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';
export declare function calculateCategory(oldestAge: number): ChoreographyCategory;
export declare function determineChoreographyType(gymnastCount: number): ChoreographyType;
export declare function generateChoreographyName(surnames: string[]): string;
export declare function calculateAge(birthDate: string): number;
export declare function isValidGymnastCount(count: number): boolean;
