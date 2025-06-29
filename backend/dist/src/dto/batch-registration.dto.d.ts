import { CreateChoreographyDto } from './create-choreography.dto';
import { CreateCoachRegistrationDto } from './create-coach-registration.dto';
import { CreateJudgeRegistrationDto } from './create-judge-registration.dto';
export declare class BatchRegistrationDto {
    choreographies?: CreateChoreographyDto[];
    coaches?: CreateCoachRegistrationDto[];
    judges?: CreateJudgeRegistrationDto[];
    tournament: {
        id: string;
        name: string;
        type: string;
        startDate: string;
        endDate: string;
        location?: string;
    };
    country: string;
}
export declare class BatchRegistrationResponseDto {
    success: boolean;
    results: {
        choreographies: any[];
        coaches: any[];
        judges: any[];
    };
    errors?: string[];
}
