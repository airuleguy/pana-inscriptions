import { ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';
import { TournamentType } from '../entities/tournament.entity';
export declare function calculateCategory(oldestAge: number): ChoreographyCategory;
export declare function getBusinessRulesForTournament(tournamentType: TournamentType): import("./business-rules/base-business-rules.interface").BusinessRulesStrategy;
export declare function determineChoreographyType(gymnastCount: number, gymnasts: Array<{
    gender: string;
}>): ChoreographyType;
export declare function generateChoreographyName(surnames: string[]): string;
export declare function calculateAge(birthDate: string): number;
export declare function isValidGymnastCount(count: number): boolean;
export declare function getChoreographyTypeDisplayName(type: ChoreographyType): string;
export declare function getExpectedGymnastCount(type: ChoreographyType): number;
