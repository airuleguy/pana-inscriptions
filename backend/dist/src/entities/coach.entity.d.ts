import { Tournament } from './tournament.entity';
export declare class Coach {
    id: string;
    figId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gender: string;
    country: string;
    level: string;
    levelDescription: string;
    tournament: Tournament;
    status: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
