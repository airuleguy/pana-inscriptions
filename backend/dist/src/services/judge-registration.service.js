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
exports.JudgeRegistrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const judge_entity_1 = require("../entities/judge.entity");
const tournament_entity_1 = require("../entities/tournament.entity");
let JudgeRegistrationService = class JudgeRegistrationService {
    constructor(judgeRepository, tournamentRepository) {
        this.judgeRepository = judgeRepository;
        this.tournamentRepository = tournamentRepository;
    }
    async create(createJudgeDto) {
        const tournament = await this.tournamentRepository.findOne({
            where: { id: createJudgeDto.tournamentId }
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${createJudgeDto.tournamentId} not found`);
        }
        const existingRegistration = await this.judgeRepository.findOne({
            where: {
                figId: createJudgeDto.figId,
                tournament: { id: createJudgeDto.tournamentId }
            }
        });
        if (existingRegistration) {
            throw new common_1.BadRequestException(`Judge ${createJudgeDto.figId} is already registered for this tournament`);
        }
        const judge = this.judgeRepository.create({
            ...createJudgeDto,
            tournament,
        });
        return await this.judgeRepository.save(judge);
    }
    async findAll(country, tournamentId) {
        const queryBuilder = this.judgeRepository.createQueryBuilder('judge')
            .leftJoinAndSelect('judge.tournament', 'tournament');
        if (country) {
            queryBuilder.where('judge.country = :country', { country });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        return await queryBuilder.getMany();
    }
    async findOne(id) {
        const judge = await this.judgeRepository.findOne({
            where: { id },
            relations: ['tournament']
        });
        if (!judge) {
            throw new common_1.NotFoundException(`Judge registration with ID ${id} not found`);
        }
        return judge;
    }
    async update(id, updateData) {
        const judge = await this.findOne(id);
        if (updateData.tournamentId && updateData.tournamentId !== judge.tournament.id) {
            const tournament = await this.tournamentRepository.findOne({
                where: { id: updateData.tournamentId }
            });
            if (!tournament) {
                throw new common_1.NotFoundException(`Tournament with ID ${updateData.tournamentId} not found`);
            }
            judge.tournament = tournament;
        }
        Object.assign(judge, updateData);
        return await this.judgeRepository.save(judge);
    }
    async remove(id) {
        const judge = await this.findOne(id);
        await this.judgeRepository.remove(judge);
    }
    async getCountryStats(country) {
        const judges = await this.findAll(country);
        const byTournament = judges.reduce((acc, judge) => {
            const tournamentName = judge.tournament.name;
            acc[tournamentName] = (acc[tournamentName] || 0) + 1;
            return acc;
        }, {});
        const byCategory = judges.reduce((acc, judge) => {
            const category = judge.categoryDescription;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        return {
            totalJudges: judges.length,
            byTournament,
            byCategory,
        };
    }
    async findByStatus(status, country, tournamentId) {
        const queryBuilder = this.judgeRepository.createQueryBuilder('judge')
            .leftJoinAndSelect('judge.tournament', 'tournament')
            .where('judge.status = :status', { status });
        if (country) {
            queryBuilder.andWhere('judge.country = :country', { country });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        return await queryBuilder.getMany();
    }
    async updateStatus(id, status, notes) {
        try {
            const judge = await this.judgeRepository.findOne({ where: { id } });
            if (!judge) {
                return false;
            }
            judge.status = status;
            if (notes) {
                judge.notes = notes;
            }
            await this.judgeRepository.save(judge);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async updateStatusBatch(fromStatus, toStatus, country, tournamentId, notes) {
        const queryBuilder = this.judgeRepository.createQueryBuilder('judge')
            .leftJoinAndSelect('judge.tournament', 'tournament')
            .where('judge.status = :fromStatus', { fromStatus });
        if (country) {
            queryBuilder.andWhere('judge.country = :country', { country });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        const judges = await queryBuilder.getMany();
        for (const judge of judges) {
            judge.status = toStatus;
            if (notes) {
                judge.notes = notes;
            }
        }
        await this.judgeRepository.save(judges);
        return judges.length;
    }
};
exports.JudgeRegistrationService = JudgeRegistrationService;
exports.JudgeRegistrationService = JudgeRegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(judge_entity_1.Judge)),
    __param(1, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], JudgeRegistrationService);
//# sourceMappingURL=judge-registration.service.js.map