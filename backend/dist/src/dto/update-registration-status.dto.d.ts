import { RegistrationStatus } from '../constants/registration-status';
export declare class UpdateRegistrationStatusDto {
    status: RegistrationStatus;
    notes?: string;
}
export declare class BatchStatusUpdateDto {
    registrationIds: string[];
    status: RegistrationStatus;
    notes?: string;
}
