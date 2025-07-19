import { Tournament } from './tournament.entity';
import { RegistrationStatus } from '../constants/registration-status';
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
    status: RegistrationStatus;
    notes?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
