export declare class GymnastDto {
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
    licenseExpiryDate?: Date;
    age: number;
    category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
    isLocal?: boolean;
}
