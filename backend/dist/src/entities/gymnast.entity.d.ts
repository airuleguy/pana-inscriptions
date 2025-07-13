import { Choreography } from './choreography.entity';
export declare class Gymnast {
    id: string;
    figId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE';
    country: string;
    dateOfBirth: Date;
    discipline: string;
    licenseValid: boolean;
    licenseExpiryDate: Date;
    age: number;
    category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
    isLocal: boolean;
    choreographies: Choreography[];
    createdAt: Date;
    updatedAt: Date;
}
