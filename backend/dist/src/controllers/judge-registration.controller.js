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
var JudgeRegistrationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JudgeRegistrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const judge_registration_service_1 = require("../services/judge-registration.service");
const judge_entity_1 = require("../entities/judge.entity");
let JudgeRegistrationController = JudgeRegistrationController_1 = class JudgeRegistrationController {
    constructor(judgeRegistrationService) {
        this.judgeRegistrationService = judgeRegistrationService;
        this.logger = new common_1.Logger(JudgeRegistrationController_1.name);
    }
    async register(registrationData) {
        const judges = Array.isArray(registrationData) ? registrationData : [registrationData];
        this.logger.log(`Registering ${judges.length} judge(es)`);
        const results = [];
        const errors = [];
        for (const judgeDto of judges) {
            try {
                const judge = await this.judgeRegistrationService.create(judgeDto);
                results.push(judge);
                this.logger.log(`Successfully registered judge: ${judge.fullName}`);
            }
            catch (error) {
                const errorMessage = `Failed to register judge "${judgeDto.fullName}": ${error.message}`;
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
        this.logger.log(`Judge registration completed: ${results.length}/${judges.length} successful`);
        return response;
    }
    async findAll(country, tournamentId) {
        return this.judgeRegistrationService.findAll(country, tournamentId);
    }
    async findOne(id) {
        return this.judgeRegistrationService.findOne(id);
    }
    async update(id, updateData) {
        return this.judgeRegistrationService.update(id, updateData);
    }
    async remove(id) {
        return this.judgeRegistrationService.remove(id);
    }
    async getCountryStats(country) {
        return this.judgeRegistrationService.getCountryStats(country);
    }
};
exports.JudgeRegistrationController = JudgeRegistrationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Register judges',
        description: 'Register one or multiple judges for tournaments'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Judges registered successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or duplicate registration'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JudgeRegistrationController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get judge registrations',
        description: 'Retrieve judge registrations with optional filters'
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
        description: 'List of judge registrations',
        type: [judge_entity_1.Judge]
    }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('tournament')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JudgeRegistrationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get judge registration by ID',
        description: 'Retrieve a specific judge registration'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Judge registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Judge registration details',
        type: judge_entity_1.Judge
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Judge registration not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JudgeRegistrationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update judge registration',
        description: 'Update an existing judge registration'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Judge registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Judge registration updated successfully',
        type: judge_entity_1.Judge
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Judge registration not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JudgeRegistrationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove judge registration',
        description: 'Remove a judge registration from a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Judge registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Judge registration removed successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Judge registration not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JudgeRegistrationController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/:country'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get country registration statistics',
        description: 'Retrieve judge registration statistics for a specific country'
    }),
    (0, swagger_1.ApiParam)({
        name: 'country',
        description: 'Country code (ISO 3166-1 alpha-3)',
        example: 'USA'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Country judge registration statistics'
    }),
    __param(0, (0, common_1.Param)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JudgeRegistrationController.prototype, "getCountryStats", null);
exports.JudgeRegistrationController = JudgeRegistrationController = JudgeRegistrationController_1 = __decorate([
    (0, swagger_1.ApiTags)('judge-registrations'),
    (0, common_1.Controller)('api/v1/judge-registrations'),
    __metadata("design:paramtypes", [judge_registration_service_1.JudgeRegistrationService])
], JudgeRegistrationController);
//# sourceMappingURL=judge-registration.controller.js.map