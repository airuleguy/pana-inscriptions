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
exports.CreateCoachRegistrationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCoachRegistrationDto {
}
exports.CreateCoachRegistrationDto = CreateCoachRegistrationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the coach', example: 'COACH123456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "figId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach first name', example: 'John' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach last name', example: 'Smith' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach full name', example: 'John Smith' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'MALE' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach level', example: 'L1, L2' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Level description', example: 'Level 1, Level 2' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "levelDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tournament ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "tournamentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachRegistrationDto.prototype, "notes", void 0);
//# sourceMappingURL=create-coach-registration.dto.js.map