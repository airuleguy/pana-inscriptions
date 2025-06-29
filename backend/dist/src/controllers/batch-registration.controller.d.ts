import { BatchRegistrationService } from '../services/batch-registration.service';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
export declare class BatchRegistrationController {
    private readonly batchRegistrationService;
    private readonly logger;
    constructor(batchRegistrationService: BatchRegistrationService);
    submitBatchRegistration(batchRegistrationDto: BatchRegistrationDto): Promise<BatchRegistrationResponseDto>;
}
