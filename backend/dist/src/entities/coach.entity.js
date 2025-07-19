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
exports.Coach = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const tournament_entity_1 = require("./tournament.entity");
const registration_status_1 = require("../constants/registration-status");
let Coach = class Coach {
};
exports.Coach = Coach;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique registration ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Coach.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG ID of the coach', example: 'COACH123456' }),
    (0, typeorm_1.Column)({ name: 'fig_id' }),
    __metadata("design:type", String)
], Coach.prototype, "figId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach first name', example: 'John' }),
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], Coach.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach last name', example: 'Smith' }),
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], Coach.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach full name', example: 'John Smith' }),
    (0, typeorm_1.Column)({ name: 'full_name' }),
    __metadata("design:type", String)
], Coach.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender', example: 'MALE' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Coach.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Coach.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach level', example: 'L1, L2' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Coach.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Level description', example: 'Level 1, Level 2' }),
    (0, typeorm_1.Column)({ name: 'level_description' }),
    __metadata("design:type", String)
], Coach.prototype, "levelDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tournament the coach is registered for' }),
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, tournament => tournament.id, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tournament_id' }),
    __metadata("design:type", tournament_entity_1.Tournament)
], Coach.prototype, "tournament", void 0);
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
], Coach.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Coach.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'FIG image URL', nullable: true }),
    (0, typeorm_1.Column)({ name: 'image_url', nullable: true }),
    __metadata("design:type", String)
], Coach.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registration date' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Coach.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last modification date' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Coach.prototype, "updatedAt", void 0);
exports.Coach = Coach = __decorate([
    (0, typeorm_1.Entity)('coaches')
], Coach);
//# sourceMappingURL=coach.entity.js.map