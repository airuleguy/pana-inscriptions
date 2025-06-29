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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchStatusUpdateDto = exports.UpdateRegistrationStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const registration_status_1 = require("../constants/registration-status");
class UpdateRegistrationStatusDto {
}
exports.UpdateRegistrationStatusDto = UpdateRegistrationStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New registration status',
        enum: registration_status_1.RegistrationStatus,
        example: 'SUBMITTED'
    }),
    (0, class_validator_1.IsEnum)(registration_status_1.RegistrationStatus),
    __metadata("design:type", String)
], UpdateRegistrationStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes for status change',
        example: 'Approved by tournament director',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegistrationStatusDto.prototype, "notes", void 0);
class BatchStatusUpdateDto {
}
exports.BatchStatusUpdateDto = BatchStatusUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registration IDs to update',
        type: [String],
        example: ['uuid1', 'uuid2', 'uuid3']
    }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BatchStatusUpdateDto.prototype, "registrationIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New registration status',
        enum: registration_status_1.RegistrationStatus,
        example: 'SUBMITTED'
    }),
    (0, class_validator_1.IsEnum)(registration_status_1.RegistrationStatus),
    __metadata("design:type", String)
], BatchStatusUpdateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes for status change',
        example: 'Batch submission completed',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchStatusUpdateDto.prototype, "notes", void 0);
//# sourceMappingURL=update-registration-status.dto.js.map