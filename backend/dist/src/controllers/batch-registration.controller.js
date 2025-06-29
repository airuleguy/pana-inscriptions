"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BatchRegistrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchRegistrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const batch_registration_service_1 = require("../services/batch-registration.service");
const batch_registration_dto_1 = require("../dto/batch-registration.dto");
let BatchRegistrationController = BatchRegistrationController_1 = class BatchRegistrationController {
    constructor(batchRegistrationService) {
        this.batchRegistrationService = batchRegistrationService;
        this.logger = new common_1.Logger(BatchRegistrationController_1.name);
    }
    async submitBatchRegistration(batchRegistrationDto) {
        this.logger.log('Processing batch registration request');
        try {
            const result = await this.batchRegistrationService.processBatchRegistration(batchRegistrationDto);
            this.logger.log('Batch registration processed successfully');
            return result;
        }
        catch (error) {
            this.logger.error('Failed to process batch registration:', error);
            throw error;
        }
    }
};
exports.BatchRegistrationController = BatchRegistrationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit batch registration',
        description: 'Register multiple choreographies, coaches, and judges in a single request'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Batch registration completed successfully',
        type: batch_registration_dto_1.BatchRegistrationResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or validation errors'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Internal server error during registration'
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [batch_registration_dto_1.BatchRegistrationDto]),
    __metadata("design:returntype", Promise)
], BatchRegistrationController.prototype, "submitBatchRegistration", null);
exports.BatchRegistrationController = BatchRegistrationController = BatchRegistrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('registrations'),
    (0, common_1.Controller)('api/v1/registrations'),
    __metadata("design:paramtypes", [batch_registration_service_1.BatchRegistrationService])
], BatchRegistrationController);
//# sourceMappingURL=batch-registration.controller.js.map