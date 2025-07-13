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
var ChoreographyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoreographyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const choreography_entity_1 = require("../entities/choreography.entity");
const gymnast_entity_1 = require("../entities/gymnast.entity");
const tournament_entity_1 = require("../entities/tournament.entity");
const fig_api_service_1 = require("./fig-api.service");
const gymnast_service_1 = require("./gymnast.service");
const business_rules_factory_1 = require("../utils/business-rules/business-rules-factory");
let ChoreographyService = ChoreographyService_1 = class ChoreographyService {
    constructor(choreographyRepository, gymnastRepository, tournamentRepository, figApiService, gymnastService, businessRulesFactory) {
        this.choreographyRepository = choreographyRepository;
        this.gymnastRepository = gymnastRepository;
        this.tournamentRepository = tournamentRepository;
        this.figApiService = figApiService;
        this.gymnastService = gymnastService;
        this.businessRulesFactory = businessRulesFactory;
        this.logger = new common_1.Logger(ChoreographyService_1.name);
    }
    async create(createChoreographyDto) {
        this.validateGymnastFigIds(createChoreographyDto.gymnastFigIds);
        const tournament = await this.tournamentRepository.findOne({
            where: { id: createChoreographyDto.tournamentId }
        });
        if (!tournament) {
            throw new common_1.NotFoundException(`Tournament with ID ${createChoreographyDto.tournamentId} not found`);
        }
        await this.validateBusinessRules(createChoreographyDto, tournament);
        const gymnasts = await this.fetchAndValidateGymnasts(createChoreographyDto.gymnastFigIds);
        const savedGymnasts = await this.upsertGymnasts(gymnasts);
        const choreography = this.choreographyRepository.create({
            ...createChoreographyDto,
            tournament,
            gymnasts: savedGymnasts,
        });
        const result = await this.choreographyRepository.save(choreography);
        this.logger.log(`Created choreography: ${result.name} for country: ${result.country} in tournament: ${tournament.name}`);
        return this.findOne(result.id);
    }
    async findAll() {
        return await this.choreographyRepository.find({
            relations: ['gymnasts', 'tournament'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByCountry(country) {
        return await this.choreographyRepository.find({
            where: { country: country.toUpperCase() },
            relations: ['gymnasts', 'tournament'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const choreography = await this.choreographyRepository.findOne({
            where: { id },
            relations: ['gymnasts', 'tournament'],
        });
        if (!choreography) {
            throw new common_1.NotFoundException(`Choreography with ID ${id} not found`);
        }
        return choreography;
    }
    async update(id, updateChoreographyDto) {
        const choreography = await this.findOne(id);
        if (updateChoreographyDto.gymnastFigIds) {
            const tournament = choreography.tournament;
            await this.validateBusinessRules({
                ...choreography,
                ...updateChoreographyDto,
                tournamentId: tournament.id,
            }, tournament);
            const gymnasts = await this.fetchAndValidateGymnasts(updateChoreographyDto.gymnastFigIds);
            const savedGymnasts = await this.upsertGymnasts(gymnasts);
            choreography.gymnasts = savedGymnasts;
        }
        Object.assign(choreography, updateChoreographyDto);
        const result = await this.choreographyRepository.save(choreography);
        this.logger.log(`Updated choreography: ${result.name}`);
        return this.findOne(result.id);
    }
    async remove(id) {
        const choreography = await this.findOne(id);
        await this.choreographyRepository.remove(choreography);
        this.logger.log(`Deleted choreography: ${choreography.name}`);
    }
    async validateBusinessRules(dto, tournament) {
        const strategy = this.businessRulesFactory.getStrategy(tournament.type);
        const existingCount = await this.choreographyRepository.count({
            where: {
                country: dto.country.toUpperCase(),
                category: dto.category,
                tournament: { id: tournament.id },
            },
        });
        const request = {
            country: dto.country,
            category: dto.category,
            type: dto.type,
            gymnastCount: dto.gymnastCount,
            gymnastFigIds: dto.gymnastFigIds,
            tournamentId: dto.tournamentId,
        };
        await strategy.validateChoreographyCreation(request, existingCount);
        this.validateChoreographyType(dto.gymnastCount, dto.type);
    }
    validateChoreographyType(gymnastCount, type) {
        const validCombinations = {
            [choreography_entity_1.ChoreographyType.MIND]: [1],
            [choreography_entity_1.ChoreographyType.WIND]: [1],
            [choreography_entity_1.ChoreographyType.MXP]: [2],
            [choreography_entity_1.ChoreographyType.TRIO]: [3],
            [choreography_entity_1.ChoreographyType.GRP]: [5],
            [choreography_entity_1.ChoreographyType.DNCE]: [8],
        };
        if (!validCombinations[type].includes(gymnastCount)) {
            throw new common_1.BadRequestException(`Invalid gymnast count ${gymnastCount} for choreography type ${type}`);
        }
    }
    validateGymnastFigIds(figIds) {
        const invalidIds = figIds.filter(id => !id || typeof id !== 'string' || id.trim() === '');
        if (invalidIds.length > 0) {
            throw new common_1.BadRequestException(`Invalid gymnast FIG IDs provided. Found ${invalidIds.length} empty or invalid ID(s). All gymnasts must have valid FIG IDs.`);
        }
        const uniqueIds = new Set(figIds);
        if (uniqueIds.size !== figIds.length) {
            throw new common_1.BadRequestException('Duplicate gymnast FIG IDs are not allowed in the same choreography');
        }
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const uuidIds = figIds.filter(id => uuidPattern.test(id));
        if (uuidIds.length > 0) {
            throw new common_1.BadRequestException(`Invalid FIG IDs detected. Found ${uuidIds.length} UUID format ID(s) instead of FIG IDs. Please ensure you are sending FIG IDs, not database IDs.`);
        }
    }
    async fetchAndValidateGymnasts(figIds) {
        const gymnasts = [];
        for (const figId of figIds) {
            const gymnast = await this.gymnastService.findByFigId(figId);
            if (!gymnast) {
                throw new common_1.BadRequestException(`Gymnast with FIG ID ${figId} not found`);
            }
            if (!gymnast.isLocal && !gymnast.licenseValid) {
                throw new common_1.BadRequestException(`Gymnast ${gymnast.firstName} ${gymnast.lastName} is not licensed`);
            }
            gymnasts.push(gymnast);
        }
        return gymnasts;
    }
    async upsertGymnasts(gymnastDtos) {
        const savedGymnasts = [];
        for (const dto of gymnastDtos) {
            let gymnast = await this.gymnastRepository.findOne({
                where: { figId: dto.figId },
            });
            if (!gymnast) {
                const newGymnast = new gymnast_entity_1.Gymnast();
                const { id, ...dtoWithoutId } = dto;
                Object.assign(newGymnast, dtoWithoutId);
                gymnast = newGymnast;
            }
            else {
                const { id, ...dtoWithoutId } = dto;
                Object.assign(gymnast, dtoWithoutId);
            }
            savedGymnasts.push(await this.gymnastRepository.save(gymnast));
        }
        return savedGymnasts;
    }
    async getCountryStats(country) {
        const choreographies = await this.findByCountry(country);
        const stats = {
            totalChoreographies: choreographies.length,
            byCategory: {
                [choreography_entity_1.ChoreographyCategory.YOUTH]: 0,
                [choreography_entity_1.ChoreographyCategory.JUNIOR]: 0,
                [choreography_entity_1.ChoreographyCategory.SENIOR]: 0,
            },
        };
        choreographies.forEach(choreo => {
            stats.byCategory[choreo.category]++;
        });
        return stats;
    }
    async findByStatus(status, country, tournamentId) {
        const queryBuilder = this.choreographyRepository.createQueryBuilder('choreography')
            .leftJoinAndSelect('choreography.tournament', 'tournament')
            .leftJoinAndSelect('choreography.gymnasts', 'gymnasts')
            .where('choreography.status = :status', { status });
        if (country) {
            queryBuilder.andWhere('choreography.country = :country', { country: country.toUpperCase() });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        return await queryBuilder.getMany();
    }
    async updateStatus(id, status, notes) {
        try {
            const choreography = await this.choreographyRepository.findOne({ where: { id } });
            if (!choreography) {
                return false;
            }
            choreography.status = status;
            if (notes) {
                choreography.notes = notes;
            }
            await this.choreographyRepository.save(choreography);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async updateStatusBatch(fromStatus, toStatus, country, tournamentId, notes) {
        const queryBuilder = this.choreographyRepository.createQueryBuilder('choreography')
            .leftJoinAndSelect('choreography.tournament', 'tournament')
            .where('choreography.status = :fromStatus', { fromStatus });
        if (country) {
            queryBuilder.andWhere('choreography.country = :country', { country: country.toUpperCase() });
        }
        if (tournamentId) {
            queryBuilder.andWhere('tournament.id = :tournamentId', { tournamentId });
        }
        const choreographies = await queryBuilder.getMany();
        for (const choreography of choreographies) {
            choreography.status = toStatus;
            if (notes) {
                choreography.notes = notes;
            }
        }
        await this.choreographyRepository.save(choreographies);
        return choreographies.length;
    }
};
exports.ChoreographyService = ChoreographyService;
exports.ChoreographyService = ChoreographyService = ChoreographyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(choreography_entity_1.Choreography)),
    __param(1, (0, typeorm_1.InjectRepository)(gymnast_entity_1.Gymnast)),
    __param(2, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        fig_api_service_1.FigApiService,
        gymnast_service_1.GymnastService,
        business_rules_factory_1.BusinessRulesFactory])
], ChoreographyService);
//# sourceMappingURL=choreography.service.js.map