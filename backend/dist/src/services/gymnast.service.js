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
var GymnastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymnastService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gymnast_entity_1 = require("../entities/gymnast.entity");
const fig_api_service_1 = require("./fig-api.service");
let GymnastService = GymnastService_1 = class GymnastService {
    constructor(gymnastRepository, figApiService) {
        this.gymnastRepository = gymnastRepository;
        this.figApiService = figApiService;
        this.logger = new common_1.Logger(GymnastService_1.name);
    }
    async findAll(country) {
        const figGymnasts = country
            ? await this.figApiService.getGymnastsByCountry(country)
            : await this.figApiService.getGymnasts();
        const localGymnasts = await this.getLocalGymnasts(country);
        const figIds = new Set(figGymnasts.map(g => g.figId));
        const uniqueLocalGymnasts = localGymnasts.filter(g => g.figId && !figIds.has(g.figId));
        return [...figGymnasts, ...uniqueLocalGymnasts];
    }
    async findByFigId(figId) {
        const figGymnast = await this.figApiService.getGymnastByFigId(figId);
        if (figGymnast) {
            return figGymnast;
        }
        const localGymnast = await this.gymnastRepository.findOne({
            where: { figId },
        });
        return localGymnast ? this.transformEntityToDto(localGymnast) : null;
    }
    async create(createGymnastDto) {
        const existingGymnast = await this.findByFigId(createGymnastDto.figId);
        if (existingGymnast) {
            throw new common_1.BadRequestException(`Gymnast with FIG ID ${createGymnastDto.figId} already exists`);
        }
        const dateOfBirth = new Date(createGymnastDto.dateOfBirth);
        const age = this.calculateAge(dateOfBirth);
        const category = this.calculateCategory(age);
        const gymnast = this.gymnastRepository.create({
            ...createGymnastDto,
            dateOfBirth,
            age,
            category,
            fullName: `${createGymnastDto.firstName} ${createGymnastDto.lastName}`,
            discipline: 'AER',
            licenseValid: false,
            licenseExpiryDate: null,
            isLocal: true,
        });
        const savedGymnast = await this.gymnastRepository.save(gymnast);
        this.logger.log(`Created local gymnast: ${savedGymnast.fullName} (${savedGymnast.figId})`);
        return this.transformEntityToDto(savedGymnast);
    }
    async update(id, updateGymnastDto) {
        const gymnast = await this.gymnastRepository.findOne({ where: { id } });
        if (!gymnast) {
            throw new common_1.NotFoundException(`Gymnast with ID ${id} not found`);
        }
        if (!gymnast.isLocal) {
            throw new common_1.BadRequestException('Cannot update FIG API gymnasts');
        }
        if (updateGymnastDto.dateOfBirth) {
            const dateOfBirth = new Date(updateGymnastDto.dateOfBirth);
            updateGymnastDto.age = this.calculateAge(dateOfBirth);
            updateGymnastDto.category = this.calculateCategory(updateGymnastDto.age);
        }
        if (updateGymnastDto.firstName || updateGymnastDto.lastName) {
            const firstName = updateGymnastDto.firstName || gymnast.firstName;
            const lastName = updateGymnastDto.lastName || gymnast.lastName;
            updateGymnastDto.fullName = `${firstName} ${lastName}`;
        }
        Object.assign(gymnast, updateGymnastDto);
        const savedGymnast = await this.gymnastRepository.save(gymnast);
        this.logger.log(`Updated local gymnast: ${savedGymnast.fullName} (${savedGymnast.figId})`);
        return this.transformEntityToDto(savedGymnast);
    }
    async remove(id) {
        const gymnast = await this.gymnastRepository.findOne({ where: { id } });
        if (!gymnast) {
            throw new common_1.NotFoundException(`Gymnast with ID ${id} not found`);
        }
        if (!gymnast.isLocal) {
            throw new common_1.BadRequestException('Cannot delete FIG API gymnasts');
        }
        await this.gymnastRepository.remove(gymnast);
        this.logger.log(`Deleted local gymnast: ${gymnast.fullName} (${gymnast.figId})`);
    }
    async getLocalGymnasts(country) {
        const queryBuilder = this.gymnastRepository.createQueryBuilder('gymnast')
            .where('gymnast.isLocal = :isLocal', { isLocal: true });
        if (country) {
            queryBuilder.andWhere('UPPER(gymnast.country) = UPPER(:country)', { country });
        }
        const gymnasts = await queryBuilder.getMany();
        return gymnasts.map(g => this.transformEntityToDto(g));
    }
    transformEntityToDto(gymnast) {
        return {
            id: gymnast.id,
            figId: gymnast.figId,
            firstName: gymnast.firstName,
            lastName: gymnast.lastName,
            fullName: gymnast.fullName,
            gender: gymnast.gender,
            country: gymnast.country,
            dateOfBirth: gymnast.dateOfBirth,
            discipline: gymnast.discipline,
            licenseValid: gymnast.licenseValid,
            licenseExpiryDate: gymnast.licenseExpiryDate,
            age: gymnast.age,
            category: gymnast.category,
            isLocal: gymnast.isLocal,
        };
    }
    calculateAge(dateOfBirth) {
        const today = new Date();
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDiff = today.getMonth() - dateOfBirth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        return age;
    }
    calculateCategory(age) {
        if (age <= 15)
            return 'YOUTH';
        if (age <= 17)
            return 'JUNIOR';
        return 'SENIOR';
    }
    async clearCache() {
        return this.figApiService.clearCache();
    }
};
exports.GymnastService = GymnastService;
exports.GymnastService = GymnastService = GymnastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gymnast_entity_1.Gymnast)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        fig_api_service_1.FigApiService])
], GymnastService);
//# sourceMappingURL=gymnast.service.js.map