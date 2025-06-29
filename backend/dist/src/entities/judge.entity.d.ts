import { Tournament } from './tournament.entity';
export declare class Judge {
    id: string;
    figId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    birth: string;
    gender: string;
    country: string;
    category: string;
    categoryDescription: string;
    tournament: Tournament;
    status: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
