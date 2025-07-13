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
exports.Judge = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const tournament_entity_1 = require("./tournament.entity");
const registration_status_1 = require("../constants/registration-status");
let Judge = class Judge {
};
exports.Judge = Judge;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique registration ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Judge.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the judge', example: '3622' }),
    (0, typeorm_1.Column)({ name: 'fig_id' }),
    __metadata("design:type", String)
], Judge.prototype, "figId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge first name', example: 'Reham Abdelraouf Ahmed' }),
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], Judge.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge last name', example: 'ABDELAAL' }),
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], Judge.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge full name', example: 'Reham Abdelraouf Ahmed ABDELAAL' }),
    (0, typeorm_1.Column)({ name: 'full_name' }),
    __metadata("design:type", String)
], Judge.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of birth', example: '1974-07-29' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Judge.prototype, "birth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'FEMALE' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Judge.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'EGY' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Judge.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Judge category', example: '3' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Judge.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category description', example: 'Category 3' }),
    (0, typeorm_1.Column)({ name: 'category_description' }),
    __metadata("design:type", String)
], Judge.prototype, "categoryDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tournament the judge is registered for' }),
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, tournament => tournament.id, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tournament_id' }),
    __metadata("design:type", tournament_entity_1.Tournament)
], Judge.prototype, "tournament", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registration status',
        example: 'PENDING',
        enum: registration_status_1.RegistrationStatus
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: registration_status_1.RegistrationStatus,
        enumName: 'registration_status_enum',
        default: registration_status_1.RegistrationStatus.PENDING
    }),
    __metadata("design:type", String)
], Judge.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Judge.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registration date' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Judge.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last modification date' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Judge.prototype, "updatedAt", void 0);
exports.Judge = Judge = __decorate([
    (0, typeorm_1.Entity)('judges')
], Judge);
//# sourceMappingURL=judge.entity.js.map