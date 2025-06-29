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
var BatchRegistrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const choreography_service_1 = require("./choreography.service");
const coach_registration_service_1 = require("./coach-registration.service");
const judge_registration_service_1 = require("./judge-registration.service");
const registration_status_1 = require("../constants/registration-status");
let BatchRegistrationService = BatchRegistrationService_1 = class BatchRegistrationService {
    constructor(choreographyService, coachRegistrationService, judgeRegistrationService) {
        this.choreographyService = choreographyService;
        this.coachRegistrationService = coachRegistrationService;
        this.judgeRegistrationService = judgeRegistrationService;
        this.logger = new common_1.Logger(BatchRegistrationService_1.name);
    }
    async getExistingRegistrations(country, tournamentId) {
        this.logger.log(`Getting existing registrations for country: ${country}, tournament: ${tournamentId}`);
        try {
            const [choreographies, coaches, judges] = await Promise.all([
                this.choreographyService.findAll(),
                this.coachRegistrationService.findAll(country, tournamentId),
                this.judgeRegistrationService.findAll(country, tournamentId),
            ]);
            const filteredChoreographies = choreographies.filter(c => c.country === country && c.tournament.id === tournamentId);
            return {
                choreographies: filteredChoreographies,
                coaches,
                judges,
                totals: {
                    choreographies: filteredChoreographies.length,
                    coaches: coaches.length,
                    judges: judges.length,
                    total: filteredChoreographies.length + coaches.length + judges.length,
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get existing registrations: ${error.message}`);
            throw error;
        }
    }
    async getRegistrationSummary(country, tournamentId) {
        const existingRegistrations = await this.getExistingRegistrations(country, tournamentId);
        return {
            ...existingRegistrations,
            summary: {
                country,
                tournamentId,
                lastUpdated: new Date(),
                registrationStatus: 'IN_PROGRESS',
            }
        };
    }
    async processBatchRegistration(batchDto) {
        const results = {
            choreographies: [],
            coaches: [],
            judges: [],
        };
        const errors = [];
        this.logger.log(`Processing batch registration for country: ${batchDto.country}, tournament: ${batchDto.tournament.name}`);
        if (batchDto.choreographies && batchDto.choreographies.length > 0) {
            this.logger.log(`Processing ${batchDto.choreographies.length} choreographies`);
            for (const choreographyDto of batchDto.choreographies) {
                try {
                    const choreography = await this.choreographyService.create(choreographyDto);
                    results.choreographies.push(choreography);
                    this.logger.log(`Successfully registered choreography: ${choreography.name}`);
                }
                catch (error) {
                    const errorMessage = `Failed to register choreography "${choreographyDto.name}": ${error.message}`;
                    this.logger.error(errorMessage);
                    errors.push(errorMessage);
                }
            }
        }
        if (batchDto.coaches && batchDto.coaches.length > 0) {
            this.logger.log(`Processing ${batchDto.coaches.length} coaches`);
            for (const coachData of batchDto.coaches) {
                try {
                    const coachRegistrationDto = {
                        figId: coachData.id,
                        firstName: coachData.firstName,
                        lastName: coachData.lastName,
                        fullName: coachData.fullName,
                        gender: coachData.gender,
                        country: coachData.country,
                        level: coachData.level,
                        levelDescription: coachData.levelDescription,
                        tournamentId: batchDto.tournament.id,
                    };
                    const coach = await this.coachRegistrationService.create(coachRegistrationDto);
                    results.coaches.push(coach);
                    this.logger.log(`Successfully registered coach: ${coach.fullName}`);
                }
                catch (error) {
                    const errorMessage = `Failed to register coach "${coachData.fullName}": ${error.message}`;
                    this.logger.error(errorMessage);
                    errors.push(errorMessage);
                }
            }
        }
        if (batchDto.judges && batchDto.judges.length > 0) {
            this.logger.log(`Processing ${batchDto.judges.length} judges`);
            for (const judgeData of batchDto.judges) {
                try {
                    const judgeRegistrationDto = {
                        figId: judgeData.id,
                        firstName: judgeData.firstName,
                        lastName: judgeData.lastName,
                        fullName: judgeData.fullName,
                        birth: judgeData.birth,
                        gender: judgeData.gender,
                        country: judgeData.country,
                        category: judgeData.category,
                        categoryDescription: judgeData.categoryDescription,
                        tournamentId: batchDto.tournament.id,
                    };
                    const judge = await this.judgeRegistrationService.create(judgeRegistrationDto);
                    results.judges.push(judge);
                    this.logger.log(`Successfully registered judge: ${judge.fullName}`);
                }
                catch (error) {
                    const errorMessage = `Failed to register judge "${judgeData.fullName}": ${error.message}`;
                    this.logger.error(errorMessage);
                    errors.push(errorMessage);
                }
            }
        }
        const totalRegistered = results.choreographies.length + results.coaches.length + results.judges.length;
        const totalAttempted = (batchDto.choreographies?.length || 0) + (batchDto.coaches?.length || 0) + (batchDto.judges?.length || 0);
        this.logger.log(`Batch registration completed: ${totalRegistered}/${totalAttempted} successful registrations`);
        const response = {
            success: errors.length === 0,
            results,
        };
        if (errors.length > 0) {
            response.errors = errors;
        }
        return response;
    }
    async getTournamentStats(tournamentId) {
        const [choreographies, coaches, judges] = await Promise.all([
            this.choreographyService.findAll().then(items => items.filter(c => c.tournament.id === tournamentId).length),
            this.coachRegistrationService.findAll(undefined, tournamentId).then(items => items.length),
            this.judgeRegistrationService.findAll(undefined, tournamentId).then(items => items.length),
        ]);
        return {
            choreographies,
            coaches,
            judges,
            total: choreographies + coaches + judges,
        };
    }
    async getRegistrationsByStatus(country, tournamentId, status) {
        this.logger.log(`Getting ${status} registrations for country: ${country}, tournament: ${tournamentId}`);
        try {
            const [choreographies, coaches, judges] = await Promise.all([
                this.choreographyService.findByStatus(status, country, tournamentId),
                this.coachRegistrationService.findByStatus(status, country, tournamentId),
                this.judgeRegistrationService.findByStatus(status, country, tournamentId),
            ]);
            return {
                choreographies,
                coaches,
                judges,
                totals: {
                    choreographies: choreographies.length,
                    coaches: coaches.length,
                    judges: judges.length,
                    total: choreographies.length + coaches.length + judges.length,
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get registrations by status: ${error.message}`);
            throw error;
        }
    }
    async submitAllPendingRegistrations(country, tournamentId, notes) {
        this.logger.log(`Submitting all pending registrations for country: ${country}, tournament: ${tournamentId}`);
        const errors = [];
        let updatedCounts = {
            choreographies: 0,
            coaches: 0,
            judges: 0,
            total: 0,
        };
        try {
            const choreographyCount = await this.choreographyService.updateStatusBatch(registration_status_1.RegistrationStatus.PENDING, registration_status_1.RegistrationStatus.SUBMITTED, country, tournamentId, notes);
            updatedCounts.choreographies = choreographyCount;
            const coachCount = await this.coachRegistrationService.updateStatusBatch(registration_status_1.RegistrationStatus.PENDING, registration_status_1.RegistrationStatus.SUBMITTED, country, tournamentId, notes);
            updatedCounts.coaches = coachCount;
            const judgeCount = await this.judgeRegistrationService.updateStatusBatch(registration_status_1.RegistrationStatus.PENDING, registration_status_1.RegistrationStatus.SUBMITTED, country, tournamentId, notes);
            updatedCounts.judges = judgeCount;
            updatedCounts.total = updatedCounts.choreographies + updatedCounts.coaches + updatedCounts.judges;
            this.logger.log(`Successfully submitted ${updatedCounts.total} registrations`);
            return {
                success: errors.length === 0,
                updated: updatedCounts,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            this.logger.error(`Failed to submit pending registrations: ${error.message}`);
            errors.push(`Failed to submit registrations: ${error.message}`);
            return {
                success: false,
                updated: updatedCounts,
                errors
            };
        }
    }
    async updateRegistrationsStatus(registrationIds, status, notes) {
        this.logger.log(`Updating ${registrationIds.length} registrations to status: ${status}`);
        const errors = [];
        let updatedCount = 0;
        try {
            for (const id of registrationIds) {
                try {
                    const choreographyUpdated = await this.choreographyService.updateStatus(id, status, notes);
                    const coachUpdated = await this.coachRegistrationService.updateStatus(id, status, notes);
                    const judgeUpdated = await this.judgeRegistrationService.updateStatus(id, status, notes);
                    if (choreographyUpdated || coachUpdated || judgeUpdated) {
                        updatedCount++;
                    }
                }
                catch (error) {
                    errors.push(`Failed to update registration ${id}: ${error.message}`);
                }
            }
            this.logger.log(`Successfully updated ${updatedCount}/${registrationIds.length} registrations`);
            return {
                success: errors.length === 0,
                updated: updatedCount,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            this.logger.error(`Failed to update registrations status: ${error.message}`);
            throw error;
        }
    }
};
exports.BatchRegistrationService = BatchRegistrationService;
exports.BatchRegistrationService = BatchRegistrationService = BatchRegistrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [choreography_service_1.ChoreographyService,
        coach_registration_service_1.CoachRegistrationService,
        judge_registration_service_1.JudgeRegistrationService])
], BatchRegistrationService);
//# sourceMappingURL=batch-registration.service.js.map