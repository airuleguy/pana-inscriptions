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
exports.CoachRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coach_entity_1 = require("../entities/coach.entity");
const tournament_entity_1 = require("../entities/tournament.entity");
let CoachRegistrationService = class CoachRegistrationService {
    constructor(coachRepository, tournamentRepository) {
        this.coachRepository = coachRepository;
        this.tournamentRepository = tournamentRepository;
    }
    async create(createCoachDto) {
        const tournament = await this.tournamentRepository.findOne({
            where: { id: createCoachDto.tournamentId }
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${createCoachDto.tournamentId} not found`);
        }
        const existingRegistration = await this.coachRepository.findOne({
            where: {
                figId: createCoachDto.figId,
                tournament: { id: createCoachDto.tournamentId }
            }
        });
        if (existingRegistration) {
            throw new common_1.BadRequestException(`Coach ${createCoachDto.figId} is already registered for this tournament`);
        }
        const coach = this.coachRepository.create({
            ...createCoachDto,
            tournament,
        });
        return await this.coachRepository.save(coach);
    }
    async findAll(country, tournamentId) {
        const queryBuilder = this.coachRepository.createQueryBuilder('coach')
            .leftJoinAndSelect('coach.tournament', 'tournament');
        if (country) {
            queryBuilder.where('coach.country = :country', { country });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        return await queryBuilder.getMany();
    }
    async findOne(id) {
        const coach = await this.coachRepository.findOne({
            where: { id },
            relations: ['tournament']
        });
        if (!coach) {
            throw new common_1.NotFoundException(`Coach registration with ID ${id} not found`);
        }
        return coach;
    }
    async update(id, updateData) {
        const coach = await this.findOne(id);
        if (updateData.tournamentId && updateData.tournamentId !== coach.tournament.id) {
            const tournament = await this.tournamentRepository.findOne({
                where: { id: updateData.tournamentId }
            });
            if (!tournament) {
                throw new common_1.NotFoundException(`Tournament with ID ${updateData.tournamentId} not found`);
            }
            coach.tournament = tournament;
        }
        Object.assign(coach, updateData);
        return await this.coachRepository.save(coach);
    }
    async remove(id) {
        const coach = await this.findOne(id);
        await this.coachRepository.remove(coach);
    }
    async getCountryStats(country) {
        const coaches = await this.findAll(country);
        const byTournament = coaches.reduce((acc, coach) => {
            const tournamentName = coach.tournament.name;
            acc[tournamentName] = (acc[tournamentName] || 0) + 1;
            return acc;
        }, {});
        return {
            totalCoaches: coaches.length,
            byTournament,
        };
    }
    async findByStatus(status, country, tournamentId) {
        const queryBuilder = this.coachRepository.createQueryBuilder('coach')
            .leftJoinAndSelect('coach.tournament', 'tournament')
            .where('coach.status = :status', { status });
        if (country) {
            queryBuilder.andWhere('coach.country = :country', { country });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        return await queryBuilder.getMany();
    }
    async updateStatus(id, status, notes) {
        try {
            const coach = await this.coachRepository.findOne({ where: { id } });
            if (!coach) {
                return false;
            }
            coach.status = status;
            if (notes) {
                coach.notes = notes;
            }
            await this.coachRepository.save(coach);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async updateStatusBatch(fromStatus, toStatus, country, tournamentId, notes) {
        const queryBuilder = this.coachRepository.createQueryBuilder('coach')
            .leftJoinAndSelect('coach.tournament', 'tournament')
            .where('coach.status = :fromStatus', { fromStatus });
        if (country) {
            queryBuilder.andWhere('coach.country = :country', { country });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        const coaches = await queryBuilder.getMany();
        for (const coach of coaches) {
            coach.status = toStatus;
            if (notes) {
                coach.notes = notes;
            }
        }
        await this.coachRepository.save(coaches);
        return coaches.length;
    }
};
exports.CoachRegistrationService = CoachRegistrationService;
exports.CoachRegistrationService = CoachRegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coach_entity_1.Coach)),
    __param(1, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CoachRegistrationService);
//# sourceMappingURL=coach-registration.service.js.map