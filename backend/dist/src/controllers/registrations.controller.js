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
var GlobalRegistrationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalRegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coach_registration_service_1 = require("../services/coach-registration.service");
const judge_registration_service_1 = require("../services/judge-registration.service");
const choreography_service_1 = require("../services/choreography.service");
let GlobalRegistrationsController = GlobalRegistrationsController_1 = class GlobalRegistrationsController {
    constructor(coachRegistrationService, judgeRegistrationService, choreographyService) {
        this.coachRegistrationService = coachRegistrationService;
        this.judgeRegistrationService = judgeRegistrationService;
        this.choreographyService = choreographyService;
        this.logger = new common_1.Logger(GlobalRegistrationsController_1.name);
    }
    async getAllJudgeRegistrations(country, tournamentId, category) {
        this.logger.log(`Getting global judge registrations with filters: country=${country}, tournament=${tournamentId}, category=${category}`);
        return this.judgeRegistrationService.findAll(country, tournamentId);
    }
    async getAllCoachRegistrations(country, tournamentId, level) {
        this.logger.log(`Getting global coach registrations with filters: country=${country}, tournament=${tournamentId}, level=${level}`);
        return this.coachRegistrationService.findAll(country, tournamentId);
    }
    async getAllChoreographyRegistrations(country, category, type) {
        this.logger.log(`Getting global choreography registrations with filters: country=${country}, category=${category}, type=${type}`);
        if (country) {
            return this.choreographyService.findByCountry(country);
        }
        return this.choreographyService.findAll();
    }
    async getGlobalRegistrationSummary(country) {
        this.logger.log(`Getting global registration summary${country ? ` for country: ${country}` : ''}`);
        const [judges, coaches, choreographies] = await Promise.all([
            this.judgeRegistrationService.findAll(country),
            this.coachRegistrationService.findAll(country),
            country ? this.choreographyService.findByCountry(country) : this.choreographyService.findAll()
        ]);
        const tournamentStats = {};
        judges.forEach(judge => {
            const tournamentId = judge.tournament?.id || 'unknown';
            if (!tournamentStats[tournamentId]) {
                tournamentStats[tournamentId] = { judges: 0, coaches: 0, choreographies: 0, tournamentName: judge.tournament?.name };
            }
            tournamentStats[tournamentId].judges++;
        });
        coaches.forEach(coach => {
            const tournamentId = coach.tournament?.id || 'unknown';
            if (!tournamentStats[tournamentId]) {
                tournamentStats[tournamentId] = { judges: 0, coaches: 0, choreographies: 0, tournamentName: coach.tournament?.name };
            }
            tournamentStats[tournamentId].coaches++;
        });
        choreographies.forEach(choreo => {
            const tournamentId = choreo.tournament?.id || 'unknown';
            if (!tournamentStats[tournamentId]) {
                tournamentStats[tournamentId] = { judges: 0, coaches: 0, choreographies: 0, tournamentName: choreo.tournament?.name };
            }
            tournamentStats[tournamentId].choreographies++;
        });
        return {
            totals: {
                judges: judges.length,
                coaches: coaches.length,
                choreographies: choreographies.length
            },
            byTournament: tournamentStats
        };
    }
};
exports.GlobalRegistrationsController = GlobalRegistrationsController;
__decorate([
    (0, common_1.Get)('judges'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get judge registrations across tournaments',
        description: 'Retrieve judge registrations with cross-tournament filtering capabilities'
    }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiQuery)({ name: 'tournament', required: false, description: 'Filter by tournament ID' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by judge category' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Judge registrations retrieved successfully'
    }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('tournament')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GlobalRegistrationsController.prototype, "getAllJudgeRegistrations", null);
__decorate([
    (0, common_1.Get)('coaches'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get coach registrations across tournaments',
        description: 'Retrieve coach registrations with cross-tournament filtering capabilities'
    }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiQuery)({ name: 'tournament', required: false, description: 'Filter by tournament ID' }),
    (0, swagger_1.ApiQuery)({ name: 'level', required: false, description: 'Filter by coach level' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Coach registrations retrieved successfully'
    }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('tournament')),
    __param(2, (0, common_1.Query)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GlobalRegistrationsController.prototype, "getAllCoachRegistrations", null);
__decorate([
    (0, common_1.Get)('choreographies'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get choreography registrations across tournaments',
        description: 'Retrieve choreography registrations with cross-tournament filtering capabilities'
    }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: 'Filter by category (YOUTH, JUNIOR, SENIOR)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filter by type (MIND, WIND, MXP, TRIO, GRP, DNCE)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Choreography registrations retrieved successfully'
    }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GlobalRegistrationsController.prototype, "getAllChoreographyRegistrations", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get global registration summary',
        description: 'Get summary statistics across all tournaments and countries'
    }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Global registration summary retrieved successfully'
    }),
    __param(0, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GlobalRegistrationsController.prototype, "getGlobalRegistrationSummary", null);
exports.GlobalRegistrationsController = GlobalRegistrationsController = GlobalRegistrationsController_1 = __decorate([
    (0, swagger_1.ApiTags)('global-registrations'),
    (0, common_1.Controller)('api/v1/registrations'),
    __metadata("design:paramtypes", [coach_registration_service_1.CoachRegistrationService,
        judge_registration_service_1.JudgeRegistrationService,
        choreography_service_1.ChoreographyService])
], GlobalRegistrationsController);
//# sourceMappingURL=registrations.controller.js.map