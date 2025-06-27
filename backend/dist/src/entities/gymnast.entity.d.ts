import { Choreography } from './choreography.entity';
export declare class Gymnast {
    id: string;
    figId: string;
    firstName: string;
    lastName: string;
    gender: string;
    country: string;
    birthDate: string;
    discipline: string;
    isLicensed: boolean;
    choreographies: Choreography[];
    createdAt: Date;
    updatedAt: Date;
}
