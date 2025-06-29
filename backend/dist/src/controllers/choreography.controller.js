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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoreographyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const choreography_service_1 = require("../services/choreography.service");
const create_choreography_dto_1 = require("../dto/create-choreography.dto");
const update_choreography_dto_1 = require("../dto/update-choreography.dto");
const choreography_entity_1 = require("../entities/choreography.entity");
const country_auth_guard_1 = require("../guards/country-auth.guard");
let ChoreographyController = class ChoreographyController {
    constructor(choreographyService) {
        this.choreographyService = choreographyService;
    }
    async create(createChoreographyDto, request) {
        return this.choreographyService.create(createChoreographyDto);
    }
    async findAll(request) {
        const country = request.userCountry;
        return this.choreographyService.findByCountry(country);
    }
    async findOne(id) {
        return this.choreographyService.findOne(id);
    }
    async update(id, updateChoreographyDto) {
        return this.choreographyService.update(id, updateChoreographyDto);
    }
    async remove(id) {
        return this.choreographyService.remove(id);
    }
    async getCountryStats(country) {
        return this.choreographyService.getCountryStats(country);
    }
};
exports.ChoreographyController = ChoreographyController;
__decorate([
    (0, common_1.Post)(),
    (0, country_auth_guard_1.CountryScoped)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new choreography',
        description: 'Register a new choreography from your country for the tournament with validation of business rules'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Choreography created successfully',
        type: choreography_entity_1.Choreography
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or business rule violation'
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_choreography_dto_1.CreateChoreographyDto, Object]),
    __metadata("design:returntype", Promise)
], ChoreographyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, country_auth_guard_1.CountryScoped)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all choreographies from your country',
        description: 'Retrieve all registered choreographies from your country'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of choreographies',
        type: [choreography_entity_1.Choreography]
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChoreographyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get choreography by ID',
        description: 'Retrieve a specific choreography with all gymnast details'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Choreography UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Choreography details',
        type: choreography_entity_1.Choreography
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Choreography not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChoreographyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update choreography',
        description: 'Update an existing choreography with validation'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Choreography UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Choreography updated successfully',
        type: choreography_entity_1.Choreography
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Choreography not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or business rule violation'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_choreography_dto_1.UpdateChoreographyDto]),
    __metadata("design:returntype", Promise)
], ChoreographyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete choreography',
        description: 'Remove a choreography from the tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Choreography UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Choreography deleted successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Choreography not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChoreographyController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/:country'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get country statistics',
        description: 'Retrieve registration statistics for a specific country'
    }),
    (0, swagger_1.ApiParam)({
        name: 'country',
        description: 'Country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Country registration statistics'
    }),
    __param(0, (0, common_1.Param)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChoreographyController.prototype, "getCountryStats", null);
exports.ChoreographyController = ChoreographyController = __decorate([
    (0, swagger_1.ApiTags)('choreographies'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(country_auth_guard_1.CountryAuthGuard),
    (0, common_1.Controller)('choreographies'),
    __metadata("design:paramtypes", [choreography_service_1.ChoreographyService])
], ChoreographyController);
//# sourceMappingURL=choreography.controller.js.map