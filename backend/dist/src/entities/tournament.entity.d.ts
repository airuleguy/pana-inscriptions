import { IChoreography } from './types/choreography.interface';
export declare enum TournamentType {
    CAMPEONATO_PANAMERICANO = "CAMPEONATO_PANAMERICANO",
    COPA_PANAMERICANA = "COPA_PANAMERICANA"
}
export declare class Tournament {
    id: string;
    name: string;
    shortName: string;
    type: TournamentType;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    isActive: boolean;
    choreographies: IChoreography[];
    createdAt: Date;
    updatedAt: Date;
}
