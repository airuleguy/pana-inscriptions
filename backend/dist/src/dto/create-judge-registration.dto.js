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
exports.CreateJudgeRegistrationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateJudgeRegistrationDto {
}
exports.CreateJudgeRegistrationDto = CreateJudgeRegistrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the judge', example: '3622' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "figId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge first name', example: 'Reham Abdelraouf Ahmed' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge last name', example: 'ABDELAAL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge full name', example: 'Reham Abdelraouf Ahmed ABDELAAL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', example: '1974-07-29' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "birth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'FEMALE' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'EGY' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge category', example: '3' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category description', example: 'Category 3' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "categoryDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tournament ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "tournamentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJudgeRegistrationDto.prototype, "notes", void 0);
//# sourceMappingURL=create-judge-registration.dto.js.map