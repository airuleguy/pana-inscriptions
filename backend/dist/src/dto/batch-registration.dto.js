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
exports.BatchRegistrationResponseDto = exports.BatchRegistrationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_choreography_dto_1 = require("./create-choreography.dto");
const create_coach_registration_dto_1 = require("./create-coach-registration.dto");
const create_judge_registration_dto_1 = require("./create-judge-registration.dto");
class BatchRegistrationDto {
}
exports.BatchRegistrationDto = BatchRegistrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of choreographies to register',
        type: [create_choreography_dto_1.CreateChoreographyDto],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_choreography_dto_1.CreateChoreographyDto),
    __metadata("design:type", Array)
], BatchRegistrationDto.prototype, "choreographies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of coaches to register',
        type: [create_coach_registration_dto_1.CreateCoachRegistrationDto],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_coach_registration_dto_1.CreateCoachRegistrationDto),
    __metadata("design:type", Array)
], BatchRegistrationDto.prototype, "coaches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of judges to register',
        type: [create_judge_registration_dto_1.CreateJudgeRegistrationDto],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_judge_registration_dto_1.CreateJudgeRegistrationDto),
    __metadata("design:type", Array)
], BatchRegistrationDto.prototype, "judges", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tournament information' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], BatchRegistrationDto.prototype, "tournament", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchRegistrationDto.prototype, "country", void 0);
class BatchRegistrationResponseDto {
}
exports.BatchRegistrationResponseDto = BatchRegistrationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the batch registration was successful' }),
    __metadata("design:type", Boolean)
], BatchRegistrationResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registration results' }),
    __metadata("design:type", Object)
], BatchRegistrationResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of errors if any occurred', required: false }),
    __metadata("design:type", Array)
], BatchRegistrationResponseDto.prototype, "errors", void 0);
//# sourceMappingURL=batch-registration.dto.js.map