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
exports.TournamentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tournament_service_1 = require("../services/tournament.service");
const create_tournament_dto_1 = require("../dto/create-tournament.dto");
const update_tournament_dto_1 = require("../dto/update-tournament.dto");
const tournament_entity_1 = require("../entities/tournament.entity");
let TournamentController = class TournamentController {
    constructor(tournamentService) {
        this.tournamentService = tournamentService;
    }
    create(createTournamentDto) {
        return this.tournamentService.create(createTournamentDto);
    }
    findAll(activeOnly) {
        if (activeOnly === 'true') {
            return this.tournamentService.findActive();
        }
        return this.tournamentService.findAll();
    }
    findByType(type) {
        return this.tournamentService.findByType(type);
    }
    findOne(id) {
        return this.tournamentService.findOne(id);
    }
    getTournamentStats(id) {
        return this.tournamentService.getTournamentStats(id);
    }
    update(id, updateTournamentDto) {
        return this.tournamentService.update(id, updateTournamentDto);
    }
    remove(id) {
        return this.tournamentService.remove(id);
    }
};
exports.TournamentController = TournamentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new tournament',
        description: 'Create a new tournament with specified dates and location'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Tournament created successfully',
        type: tournament_entity_1.Tournament
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tournament_dto_1.CreateTournamentDto]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all tournaments',
        description: 'Retrieve all tournaments, optionally filter by active status'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'active',
        required: false,
        description: 'Filter by active status (true/false)',
        example: 'true'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournaments retrieved successfully',
        type: [tournament_entity_1.Tournament]
    }),
    __param(0, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-type/:type'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournaments by type',
        description: 'Retrieve tournaments filtered by tournament type'
    }),
    (0, swagger_1.ApiParam)({
        name: 'type',
        description: 'Tournament type',
        enum: tournament_entity_1.TournamentType
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournaments retrieved successfully',
        type: [tournament_entity_1.Tournament]
    }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament by ID',
        description: 'Retrieve a specific tournament with its choreographies'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournament retrieved successfully',
        type: tournament_entity_1.Tournament
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tournament not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get tournament statistics',
        description: 'Retrieve detailed statistics for a specific tournament'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournament statistics retrieved successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tournament not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "getTournamentStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update tournament',
        description: 'Update tournament details'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Tournament updated successfully',
        type: tournament_entity_1.Tournament
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tournament not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data'
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tournament_dto_1.UpdateTournamentDto]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete tournament',
        description: 'Remove a tournament from the system'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Tournament UUID' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Tournament deleted successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Tournament not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentController.prototype, "remove", null);
exports.TournamentController = TournamentController = __decorate([
    (0, swagger_1.ApiTags)('tournaments'),
    (0, common_1.Controller)('api/v1/tournaments'),
    __metadata("design:paramtypes", [tournament_service_1.TournamentService])
], TournamentController);
//# sourceMappingURL=tournament.controller.js.map