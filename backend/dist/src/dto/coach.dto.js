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
exports.CoachDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CoachDto {
}
exports.CoachDto = CoachDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the coach', example: 'COACH123456' }),
    __metadata("design:type", String)
], CoachDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name', example: 'John' }),
    __metadata("design:type", String)
], CoachDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'Smith' }),
    __metadata("design:type", String)
], CoachDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name', example: 'John Smith' }),
    __metadata("design:type", String)
], CoachDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'MALE', enum: ['MALE', 'FEMALE'] }),
    __metadata("design:type", String)
], CoachDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code', example: 'USA' }),
    __metadata("design:type", String)
], CoachDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discipline', example: 'AER' }),
    __metadata("design:type", String)
], CoachDto.prototype, "discipline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach level', example: 'L1, L2' }),
    __metadata("design:type", String)
], CoachDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Level description', example: 'Level 1 Coach, Level 2 Coach' }),
    __metadata("design:type", String)
], CoachDto.prototype, "levelDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG image URL', nullable: true, example: 'https://www.gymnastics.sport/asset.php?id=bpic_COACH123456' }),
    __metadata("design:type", String)
], CoachDto.prototype, "imageUrl", void 0);
//# sourceMappingURL=coach.dto.js.map