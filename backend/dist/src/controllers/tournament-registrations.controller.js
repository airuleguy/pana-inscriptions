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
var TournamentRegistrationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentRegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coach_registration_service_1 = require("../services/coach-registration.service");
const judge_registration_service_1 = require("../services/judge-registration.service");
const choreography_service_1 = require("../services/choreography.service");
const batch_registration_service_1 = require("../services/batch-registration.service");
const batch_registration_dto_1 = require("../dto/batch-registration.dto");
const coach_entity_1 = require("../entities/coach.entity");
const judge_entity_1 = require("../entities/judge.entity");
const choreography_entity_1 = require("../entities/choreography.entity");
let TournamentRegistrationsController = TournamentRegistrationsController_1 = class TournamentRegistrationsController {
    constructor(coachRegistrationService, judgeRegistrationService, choreographyService, batchRegistrationService) {
        this.coachRegistrationService = coachRegistrationService;
        this.judgeRegistrationService = judgeRegistrationService;
        this.choreographyService = choreographyService;
        this.batchRegistrationService = batchRegistrationService;
        this.logger = new common_1.Logger(TournamentRegistrationsController_1.name);
    }
    async registerJudges(tournamentId, registrationData) {
        const judges = Array.isArray(registrationData) ? registrationData : [registrationData];
        judges.forEach(judge => judge.tournamentId = tournamentId);
        this.logger.log(`Registering ${judges.length} judge(s) for tournament: ${tournamentId}`);
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
        return {
            success: errors.length === 0,
            results,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    async getTournamentJudges(tournamentId, country) {
        this.logger.log(`Getting judge registrations for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
        return this.judgeRegistrationService.findAll(country, tournamentId);
    }
    async updateJudgeRegistration(tournamentId, judgeId, updateData) {
        delete updateData.tournamentId;
        this.logger.log(`Updating judge registration: ${judgeId} for tournament: ${tournamentId}`);
        return this.judgeRegistrationService.update(judgeId, updateData);
    }
    async removeJudgeRegistration(tournamentId, judgeId) {
        this.logger.log(`Removing judge registration: ${judgeId} from tournament: ${tournamentId}`);
        return this.judgeRegistrationService.remove(judgeId);
    }
    async registerCoaches(tournamentId, registrationData) {
        const coaches = Array.isArray(registrationData) ? registrationData : [registrationData];
        coaches.forEach(coach => coach.tournamentId = tournamentId);
        this.logger.log(`Registering ${coaches.length} coach(es) for tournament: ${tournamentId}`);
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
        return {
            success: errors.length === 0,
            results,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    async getTournamentCoaches(tournamentId, country) {
        this.logger.log(`Getting coach registrations for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
        return this.coachRegistrationService.findAll(country, tournamentId);
    }
    async updateCoachRegistration(tournamentId, coachId, updateData) {
        delete updateData.tournamentId;
        this.logger.log(`Updating coach registration: ${coachId} for tournament: ${tournamentId}`);
        return this.coachRegistrationService.update(coachId, updateData);
    }
    async removeCoachRegistration(tournamentId, coachId) {
        this.logger.log(`Removing coach registration: ${coachId} from tournament: ${tournamentId}`);
        return this.coachRegistrationService.remove(coachId);
    }
    async registerChoreographies(tournamentId, registrationData) {
        const choreographies = Array.isArray(registrationData) ? registrationData : [registrationData];
        choreographies.forEach(choreo => choreo.tournamentId = tournamentId);
        this.logger.log(`Registering ${choreographies.length} choreograph(ies) for tournament: ${tournamentId}`);
        const results = [];
        const errors = [];
        for (const choreoDto of choreographies) {
            try {
                const choreography = await this.choreographyService.create(choreoDto);
                results.push(choreography);
                this.logger.log(`Successfully registered choreography: ${choreography.name}`);
            }
            catch (error) {
                const errorMessage = `Failed to register choreography "${choreoDto.name}": ${error.message}`;
                this.logger.error(errorMessage);
                errors.push(errorMessage);
            }
        }
        return {
            success: errors.length === 0,
            results,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    async getTournamentChoreographies(tournamentId, country, category, type) {
        this.logger.log(`Getting choreography registrations for tournament: ${tournamentId}`);
        if (country) {
            return this.choreographyService.findByCountry(country);
        }
        return this.choreographyService.findAll();
    }
    async updateChoreographyRegistration(tournamentId, choreographyId, updateData) {
        delete updateData.tournamentId;
        this.logger.log(`Updating choreography registration: ${choreographyId} for tournament: ${tournamentId}`);
        return this.choreographyService.update(choreographyId, updateData);
    }
    async removeChoreographyRegistration(tournamentId, choreographyId) {
        this.logger.log(`Removing choreography registration: ${choreographyId} from tournament: ${tournamentId}`);
        return this.choreographyService.remove(choreographyId);
    }
    async batchRegister(tournamentId, batchData) {
        batchData.choreographies?.forEach(choreo => choreo.tournamentId = tournamentId);
        batchData.coaches?.forEach(coach => coach.tournamentId = tournamentId);
        batchData.judges?.forEach(judge => judge.tournamentId = tournamentId);
        batchData.tournament.id = tournamentId;
        this.logger.log(`Processing batch registration for tournament: ${tournamentId}`);
        return this.batchRegistrationService.processBatchRegistration(batchData);
    }
    async getTournamentRegistrationSummary(tournamentId, country) {
        this.logger.log(`Getting registration summary for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
        if (country) {
            return this.batchRegistrationService.getRegistrationSummary(country, tournamentId);
        }
        return this.batchRegistrationService.getTournamentStats(tournamentId);
    }
    async getTournamentRegistrationStats(tournamentId) {
        this.logger.log(`Getting registration statistics for tournament: ${tournamentId}`);
        return this.batchRegistrationService.getTournamentStats(tournamentId);
    }
};
exports.TournamentRegistrationsController = TournamentRegistrationsController;
__decorate([
    (0, common_1.Post)('judges'),
    (0, swagger_1.ApiOperation)({
        summary: 'Register judges for tournament',
        description: 'Register one or multiple judges for a specific tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Judges registered successfully',
        type: [judge_entity_1.Judge]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or tournament-specific validation failed'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "registerJudges", null);
__decorate([
    (0, common_1.Get)('judges'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament judge registrations',
        description: 'Retrieve judge registrations for a specific tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Judge registrations retrieved successfully',
        type: [judge_entity_1.Judge]
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getTournamentJudges", null);
__decorate([
    (0, common_1.Put)('judges/:judgeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update judge registration',
        description: 'Update a judge registration for a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiParam)({ name: 'judgeId', description: 'Judge registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Judge registration updated successfully',
        type: judge_entity_1.Judge
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Param)('judgeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "updateJudgeRegistration", null);
__decorate([
    (0, common_1.Delete)('judges/:judgeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove judge registration',
        description: 'Remove a judge registration from a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiParam)({ name: 'judgeId', description: 'Judge registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Judge registration removed successfully'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Param)('judgeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "removeJudgeRegistration", null);
__decorate([
    (0, common_1.Post)('coaches'),
    (0, swagger_1.ApiOperation)({
        summary: 'Register coaches for tournament',
        description: 'Register one or multiple coaches for a specific tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Coaches registered successfully',
        type: [coach_entity_1.Coach]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or tournament-specific validation failed'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "registerCoaches", null);
__decorate([
    (0, common_1.Get)('coaches'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament coach registrations',
        description: 'Retrieve coach registrations for a specific tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Coach registrations retrieved successfully',
        type: [coach_entity_1.Coach]
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getTournamentCoaches", null);
__decorate([
    (0, common_1.Put)('coaches/:coachId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update coach registration',
        description: 'Update a coach registration for a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiParam)({ name: 'coachId', description: 'Coach registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Coach registration updated successfully',
        type: coach_entity_1.Coach
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Param)('coachId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "updateCoachRegistration", null);
__decorate([
    (0, common_1.Delete)('coaches/:coachId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove coach registration',
        description: 'Remove a coach registration from a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiParam)({ name: 'coachId', description: 'Coach registration UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Coach registration removed successfully'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Param)('coachId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "removeCoachRegistration", null);
__decorate([
    (0, common_1.Post)('choreographies'),
    (0, swagger_1.ApiOperation)({
        summary: 'Register choreographies for tournament',
        description: 'Register one or multiple choreographies for a specific tournament with automatic tournament-specific business rule validation'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Choreographies registered successfully',
        type: [choreography_entity_1.Choreography]
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input or tournament business rule violation'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "registerChoreographies", null);
__decorate([
    (0, common_1.Get)('choreographies'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament choreography registrations',
        description: 'Retrieve choreography registrations for a specific tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category (YOUTH, JUNIOR, SENIOR)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filter by choreography type (MIND, WIND, MXP, TRIO, GRP, DNCE)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Choreography registrations retrieved successfully',
        type: [choreography_entity_1.Choreography]
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Query)('country')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getTournamentChoreographies", null);
__decorate([
    (0, common_1.Put)('choreographies/:choreographyId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update choreography registration',
        description: 'Update a choreography registration for a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiParam)({ name: 'choreographyId', description: 'Choreography UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Choreography registration updated successfully',
        type: choreography_entity_1.Choreography
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Param)('choreographyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "updateChoreographyRegistration", null);
__decorate([
    (0, common_1.Delete)('choreographies/:choreographyId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove choreography registration',
        description: 'Remove a choreography registration from a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiParam)({ name: 'choreographyId', description: 'Choreography UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Choreography registration removed successfully'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Param)('choreographyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "removeChoreographyRegistration", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Batch register for tournament',
        description: 'Register multiple types of entities (judges, coaches, choreographies) for a tournament in a single request with tournament-specific validation'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Batch registration completed successfully',
        type: batch_registration_dto_1.BatchRegistrationResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or tournament business rule violations'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, batch_registration_dto_1.BatchRegistrationDto]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "batchRegister", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament registration summary',
        description: 'Get a comprehensive summary of all registrations for a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournament registration summary retrieved successfully'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getTournamentRegistrationSummary", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament registration statistics',
        description: 'Get detailed statistics for all registrations in a tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'tournamentId', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournament registration statistics retrieved successfully'
    }),
    __param(0, (0, common_1.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getTournamentRegistrationStats", null);
exports.TournamentRegistrationsController = TournamentRegistrationsController = TournamentRegistrationsController_1 = __decorate([
    (0, swagger_1.ApiTags)('tournament-registrations'),
    (0, common_1.Controller)('api/v1/tournaments/:tournamentId/registrations'),
    __metadata("design:paramtypes", [coach_registration_service_1.CoachRegistrationService,
        judge_registration_service_1.JudgeRegistrationService,
        choreography_service_1.ChoreographyService,
        batch_registration_service_1.BatchRegistrationService])
], TournamentRegistrationsController);
//# sourceMappingURL=tournament-registrations.controller.js.map