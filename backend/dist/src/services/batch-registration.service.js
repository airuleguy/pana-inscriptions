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
};
exports.BatchRegistrationService = BatchRegistrationService;
exports.BatchRegistrationService = BatchRegistrationService = BatchRegistrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [choreography_service_1.ChoreographyService,
        coach_registration_service_1.CoachRegistrationService,
        judge_registration_service_1.JudgeRegistrationService])
], BatchRegistrationService);
//# sourceMappingURL=batch-registration.service.js.map