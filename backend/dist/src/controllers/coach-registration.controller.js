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
var CoachRegistrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachRegistrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coach_registration_service_1 = require("../services/coach-registration.service");
const coach_entity_1 = require("../entities/coach.entity");
let CoachRegistrationController = CoachRegistrationController_1 = class CoachRegistrationController {
    constructor(coachRegistrationService) {
        this.coachRegistrationService = coachRegistrationService;
        this.logger = new common_1.Logger(CoachRegistrationController_1.name);
    }
    async register(registrationData) {
        const coaches = Array.isArray(registrationData) ? registrationData : [registrationData];
        this.logger.log(`Registering ${coaches.length} coach(es)`);
        const results = [];
        const errors = [];
        for (const coachDto of coaches) {
            try {
                const coach = await this.coachRegistrationService.create(coachDto);
                results.push(coach);
                this.logger.log(`Successfully registered coach: ${coach.fullName}`);
            }
            catch (error) {
                const errorMessage = `Failed to register coach "${coachDto.fullName}": ${error.message}`;
                this.logger.error(errorMessage);
                errors.push(errorMessage);
            }
        }
        const response = {
            success: errors.length === 0,
            results,
        };
        if (errors.length > 0) {
            response.errors = errors;
        }
        this.logger.log(`Coach registration completed: ${results.length}/${coaches.length} successful`);
        return response;
    }
    async findAll(country, tournamentId) {
        return this.coachRegistrationService.findAll(country, tournamentId);
    }
    async findOne(id) {
        return this.coachRegistrationService.findOne(id);
    }
    async update(id, updateData) {
        return this.coachRegistrationService.update(id, updateData);
    }
    async remove(id) {
        return this.coachRegistrationService.remove(id);
    }
    async getCountryStats(country) {
        return this.coachRegistrationService.getCountryStats(country);
    }
};
exports.CoachRegistrationController = CoachRegistrationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Register coaches',
        description: 'Register one or multiple coaches for tournaments'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Coaches registered successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or duplicate registration'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CoachRegistrationController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get coach registrations',
        description: 'Retrieve coach registrations with optional filters'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'country',
        required: false,
        description: 'Filter by country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'tournament',
        required: false,
        description: 'Filter by tournament ID',
        example: 'uuid-tournament-id'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'List of coach registrations',
        type: [coach_entity_1.Coach]
    }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('tournament')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CoachRegistrationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get coach registration by ID',
        description: 'Retrieve a specific coach registration'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Coach registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Coach registration details',
        type: coach_entity_1.Coach
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Coach registration not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachRegistrationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update coach registration',
        description: 'Update an existing coach registration'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Coach registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Coach registration updated successfully',
        type: coach_entity_1.Coach
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Coach registration not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoachRegistrationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove coach registration',
        description: 'Remove a coach registration from a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Coach registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Coach registration removed successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Coach registration not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachRegistrationController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/:country'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get country registration statistics',
        description: 'Retrieve coach registration statistics for a specific country'
    }),
    (0, swagger_1.ApiParam)({
        name: 'country',
        description: 'Country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Country coach registration statistics'
    }),
    __param(0, (0, common_1.Param)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachRegistrationController.prototype, "getCountryStats", null);
exports.CoachRegistrationController = CoachRegistrationController = CoachRegistrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('coach-registrations'),
    (0, common_1.Controller)('api/v1/coach-registrations'),
    __metadata("design:paramtypes", [coach_registration_service_1.CoachRegistrationService])
], CoachRegistrationController);
//# sourceMappingURL=coach-registration.controller.js.map