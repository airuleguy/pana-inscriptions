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
exports.GymnastDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GymnastDto {
}
exports.GymnastDto = GymnastDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Internal UUID', example: 'uuid-string' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the gymnast', example: 'FIG123456' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "figId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name', example: 'John' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'Smith' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name', example: 'John Smith' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'MALE', enum: ['MALE', 'FEMALE'] }),
    __metadata("design:type", String)
], GymnastDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code', example: 'USA' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', example: '2000-01-15T00:00:00Z' }),
    __metadata("design:type", Date)
], GymnastDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discipline', example: 'AER' }),
    __metadata("design:type", String)
], GymnastDto.prototype, "discipline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'License validity status', example: true }),
    __metadata("design:type", Boolean)
], GymnastDto.prototype, "licenseValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'License expiry date', example: '2027-05-22T00:00:00Z', nullable: true }),
    __metadata("design:type", Date)
], GymnastDto.prototype, "licenseExpiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current age', example: 24 }),
    __metadata("design:type", Number)
], GymnastDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Age category', example: 'SENIOR', enum: ['YOUTH', 'JUNIOR', 'SENIOR'] }),
    __metadata("design:type", String)
], GymnastDto.prototype, "category", void 0);
//# sourceMappingURL=gymnast.dto.js.map