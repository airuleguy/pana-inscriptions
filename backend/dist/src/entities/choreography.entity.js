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
exports.Choreography = exports.ChoreographyType = exports.ChoreographyCategory = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const gymnast_entity_1 = require("./gymnast.entity");
const categories_1 = require("../constants/categories");
Object.defineProperty(exports, "ChoreographyCategory", { enumerable: true, get: function () { return categories_1.ChoreographyCategory; } });
Object.defineProperty(exports, "ChoreographyType", { enumerable: true, get: function () { return categories_1.ChoreographyType; } });
const registration_status_1 = require("../constants/registration-status");
let Choreography = class Choreography {
};
exports.Choreography = Choreography;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique choreography ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Choreography.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Choreography name', example: 'Elite Team Routine' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Choreography.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Choreography.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: categories_1.ChoreographyCategory
    }),
    __metadata("design:type", String)
], Choreography.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: categories_1.ChoreographyType
    }),
    __metadata("design:type", String)
], Choreography.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Choreography.prototype, "gymnastCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Choreography.prototype, "oldestGymnastAge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Choreography.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registration status',
        example: 'PENDING',
        enum: registration_status_1.RegistrationStatus
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: registration_status_1.RegistrationStatus,
        default: registration_status_1.RegistrationStatus.PENDING
    }),
    __metadata("design:type", String)
], Choreography.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('Tournament', 'choreographies', {
        nullable: false,
        eager: true
    }),
    (0, typeorm_1.JoinColumn)({ name: 'tournament_id' }),
    __metadata("design:type", Object)
], Choreography.prototype, "tournament", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => gymnast_entity_1.Gymnast, gymnast => gymnast.choreographies, {
        cascade: true,
        eager: true
    }),
    (0, typeorm_1.JoinTable)({
        name: 'choreography_gymnasts',
        joinColumn: {
            name: 'choreography_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'gymnast_id',
            referencedColumnName: 'id'
        }
    }),
    __metadata("design:type", Array)
], Choreography.prototype, "gymnasts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Choreography.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Choreography.prototype, "updatedAt", void 0);
exports.Choreography = Choreography = __decorate([
    (0, typeorm_1.Entity)('choreographies')
], Choreography);
//# sourceMappingURL=choreography.entity.js.map