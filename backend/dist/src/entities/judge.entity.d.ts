import { Tournament } from './tournament.entity';
import { RegistrationStatus } from '../constants/registration-status';
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
    status: RegistrationStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
