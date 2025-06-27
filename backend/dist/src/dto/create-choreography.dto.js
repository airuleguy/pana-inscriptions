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
exports.CreateChoreographyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const choreography_entity_1 = require("../entities/choreography.entity");
class CreateChoreographyDto {
}
exports.CreateChoreographyDto = CreateChoreographyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the choreography (auto-generated from gymnast surnames)',
        example: 'SMITH-JONES-BROWN'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChoreographyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChoreographyDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category based on oldest gymnast age',
        enum: choreography_entity_1.ChoreographyCategory,
        example: choreography_entity_1.ChoreographyCategory.SENIOR
    }),
    (0, class_validator_1.IsEnum)(choreography_entity_1.ChoreographyCategory),
    __metadata("design:type", String)
], CreateChoreographyDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of choreography based on number of gymnasts',
        enum: choreography_entity_1.ChoreographyType,
        example: choreography_entity_1.ChoreographyType.TRIO
    }),
    (0, class_validator_1.IsEnum)(choreography_entity_1.ChoreographyType),
    __metadata("design:type", String)
], CreateChoreographyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of gymnasts in the choreography',
        minimum: 1,
        maximum: 8,
        example: 3
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(8),
    __metadata("design:type", Number)
], CreateChoreographyDto.prototype, "gymnastCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Age of the oldest gymnast',
        minimum: 10,
        maximum: 50,
        example: 22
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateChoreographyDto.prototype, "oldestGymnastAge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of FIG IDs for the gymnasts',
        type: [String],
        example: ['FIG123456', 'FIG789012', 'FIG345678']
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(8),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateChoreographyDto.prototype, "gymnastFigIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional notes or comments',
        required: false,
        example: 'Special requirements or comments'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChoreographyDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tournament ID for the choreography',
        example: '123e4567-e89b-12d3-a456-426614174000'
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateChoreographyDto.prototype, "tournamentId", void 0);
//# sourceMappingURL=create-choreography.dto.js.map