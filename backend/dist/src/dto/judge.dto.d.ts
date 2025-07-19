export declare class JudgeDto {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    birth: string;
    dateOfBirth: Date;
    gender: 'MALE' | 'FEMALE';
    country: string;
    discipline: string;
    category: string;
    categoryDescription: string;
    age: number;
    imageUrl?: string;
}
