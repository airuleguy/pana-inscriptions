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
var TournamentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tournament_entity_1 = require("../entities/tournament.entity");
let TournamentService = TournamentService_1 = class TournamentService {
    constructor(tournamentRepository) {
        this.tournamentRepository = tournamentRepository;
        this.logger = new common_1.Logger(TournamentService_1.name);
    }
    async create(createTournamentDto) {
        const tournament = this.tournamentRepository.create(createTournamentDto);
        const result = await this.tournamentRepository.save(tournament);
        this.logger.log(`Created tournament: ${result.name} (${result.type})`);
        return result;
    }
    async findAll() {
        return this.tournamentRepository.find({
            order: { startDate: 'DESC' },
            relations: ['choreographies'],
        });
    }
    async findActive() {
        return this.tournamentRepository.find({
            where: { isActive: true },
            order: { startDate: 'DESC' },
            relations: ['choreographies'],
        });
    }
    async findByType(type) {
        return this.tournamentRepository.find({
            where: { type },
            order: { startDate: 'DESC' },
            relations: ['choreographies'],
        });
    }
    async findOne(id) {
        const tournament = await this.tournamentRepository.findOne({
            where: { id },
            relations: ['choreographies', 'choreographies.gymnasts'],
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }
    async update(id, updateTournamentDto) {
        const tournament = await this.findOne(id);
        Object.assign(tournament, updateTournamentDto);
        const result = await this.tournamentRepository.save(tournament);
        this.logger.log(`Updated tournament: ${result.name}`);
        return result;
    }
    async remove(id) {
        const tournament = await this.findOne(id);
        await this.tournamentRepository.remove(tournament);
        this.logger.log(`Deleted tournament: ${tournament.name}`);
    }
    async getTournamentStats(id) {
        const tournament = await this.findOne(id);
        const stats = {
            totalChoreographies: tournament.choreographies.length,
            choreographiesByCategory: {},
            choreographiesByType: {},
            countriesParticipating: [],
        };
        const countries = new Set();
        tournament.choreographies.forEach(choreo => {
            stats.choreographiesByCategory[choreo.category] =
                (stats.choreographiesByCategory[choreo.category] || 0) + 1;
            stats.choreographiesByType[choreo.type] =
                (stats.choreographiesByType[choreo.type] || 0) + 1;
            countries.add(choreo.country);
        });
        stats.countriesParticipating = Array.from(countries).sort();
        return stats;
    }
};
exports.TournamentService = TournamentService;
exports.TournamentService = TournamentService = TournamentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TournamentService);
//# sourceMappingURL=tournament.service.js.map