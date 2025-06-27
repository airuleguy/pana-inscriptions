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
const fig_api_service_1 = require("./fig-api.service");
let ChoreographyService = ChoreographyService_1 = class ChoreographyService {
    constructor(choreographyRepository, gymnastRepository, figApiService) {
        this.choreographyRepository = choreographyRepository;
        this.gymnastRepository = gymnastRepository;
        this.figApiService = figApiService;
        this.logger = new common_1.Logger(ChoreographyService_1.name);
    }
    async create(createChoreographyDto) {
        await this.validateBusinessRules(createChoreographyDto);
        const gymnasts = await this.fetchAndValidateGymnasts(createChoreographyDto.gymnastFigIds);
        const savedGymnasts = await this.upsertGymnasts(gymnasts);
        const choreography = this.choreographyRepository.create({
            ...createChoreographyDto,
            gymnasts: savedGymnasts,
        });
        const result = await this.choreographyRepository.save(choreography);
        this.logger.log(`Created choreography: ${result.name} for country: ${result.country}`);
        return result;
    }
    async findAll() {
        return this.choreographyRepository.find({
            relations: ['gymnasts'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByCountry(country) {
        return this.choreographyRepository.find({
            where: { country: country.toUpperCase() },
            relations: ['gymnasts'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const choreography = await this.choreographyRepository.findOne({
            where: { id },
            relations: ['gymnasts'],
        });
        if (!choreography) {
            throw new common_1.NotFoundException(`Choreography with ID ${id} not found`);
        }
        return choreography;
    }
    async update(id, updateChoreographyDto) {
        const choreography = await this.findOne(id);
        if (updateChoreographyDto.gymnastFigIds) {
            await this.validateBusinessRules({
                ...choreography,
                ...updateChoreographyDto,
            });
            const gymnasts = await this.fetchAndValidateGymnasts(updateChoreographyDto.gymnastFigIds);
            const savedGymnasts = await this.upsertGymnasts(gymnasts);
            choreography.gymnasts = savedGymnasts;
        }
        Object.assign(choreography, updateChoreographyDto);
        const result = await this.choreographyRepository.save(choreography);
        this.logger.log(`Updated choreography: ${result.name}`);
        return result;
    }
    async remove(id) {
        const choreography = await this.findOne(id);
        await this.choreographyRepository.remove(choreography);
        this.logger.log(`Deleted choreography: ${choreography.name}`);
    }
    async validateBusinessRules(dto) {
        const existingCount = await this.choreographyRepository.count({
            where: {
                country: dto.country.toUpperCase(),
                category: dto.category,
            },
        });
        if (existingCount >= 4) {
            throw new common_1.BadRequestException(`Maximum 4 choreographies allowed per country per category. ${dto.country} already has ${existingCount} in ${dto.category} category.`);
        }
        this.validateChoreographyType(dto.gymnastCount, dto.type);
    }
    validateChoreographyType(gymnastCount, type) {
        const validCombinations = {
            [choreography_entity_1.ChoreographyType.INDIVIDUAL]: [1],
            [choreography_entity_1.ChoreographyType.MIXED_PAIR]: [2],
            [choreography_entity_1.ChoreographyType.TRIO]: [3],
            [choreography_entity_1.ChoreographyType.GROUP]: [5],
            [choreography_entity_1.ChoreographyType.PLATFORM]: [8],
        };
        if (!validCombinations[type].includes(gymnastCount)) {
            throw new common_1.BadRequestException(`Invalid gymnast count ${gymnastCount} for choreography type ${type}`);
        }
    }
    async fetchAndValidateGymnasts(figIds) {
        const gymnasts = [];
        for (const figId of figIds) {
            const gymnast = await this.figApiService.getGymnastByFigId(figId);
            if (!gymnast) {
                throw new common_1.BadRequestException(`Gymnast with FIG ID ${figId} not found`);
            }
            if (!gymnast.isLicensed) {
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
                Object.assign(newGymnast, dto);
                gymnast = newGymnast;
            }
            else {
                Object.assign(gymnast, dto);
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
};
exports.ChoreographyService = ChoreographyService;
exports.ChoreographyService = ChoreographyService = ChoreographyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(choreography_entity_1.Choreography)),
    __param(1, (0, typeorm_1.InjectRepository)(gymnast_entity_1.Gymnast)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        fig_api_service_1.FigApiService])
], ChoreographyService);
//# sourceMappingURL=choreography.service.js.map