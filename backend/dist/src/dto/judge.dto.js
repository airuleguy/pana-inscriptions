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
exports.JudgeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class JudgeDto {
}
exports.JudgeDto = JudgeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the judge', example: '3622' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name', example: 'Reham Abdelraouf Ahmed' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'ABDELAAL' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full name', example: 'Reham Abdelraouf Ahmed ABDELAAL' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth (ISO string)', example: '1974-07-29' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "birth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth as Date object', example: '1974-07-29T00:00:00Z' }),
    __metadata("design:type", Date)
], JudgeDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'FEMALE', enum: ['MALE', 'FEMALE'] }),
    __metadata("design:type", String)
], JudgeDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code', example: 'EGY' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Discipline', example: 'AER' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "discipline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge category', example: '3' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category description', example: 'Category 3 (National)' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "categoryDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current age', example: 49 }),
    __metadata("design:type", Number)
], JudgeDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG image URL', nullable: true, example: 'https://www.gymnastics.sport/asset.php?id=bpic_3622' }),
    __metadata("design:type", String)
], JudgeDto.prototype, "imageUrl", void 0);
//# sourceMappingURL=judge.dto.js.map