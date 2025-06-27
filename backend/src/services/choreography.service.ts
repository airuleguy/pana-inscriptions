import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choreography, ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';
import { Gymnast } from '../entities/gymnast.entity';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { UpdateChoreographyDto } from '../dto/update-choreography.dto';
import { FigApiService } from './fig-api.service';

@Injectable()
export class ChoreographyService {
  private readonly logger = new Logger(ChoreographyService.name);

  constructor(
    @InjectRepository(Choreography)
    private choreographyRepository: Repository<Choreography>,
    @InjectRepository(Gymnast)
    private gymnastRepository: Repository<Gymnast>,
    private figApiService: FigApiService,
  ) {}

  async create(createChoreographyDto: CreateChoreographyDto): Promise<Choreography> {
    // Validate business rules
    await this.validateBusinessRules(createChoreographyDto);

    // Fetch and validate gymnasts from FIG API
    const gymnasts = await this.fetchAndValidateGymnasts(createChoreographyDto.gymnastFigIds);

    // Create or update gymnast entities
    const savedGymnasts = await this.upsertGymnasts(gymnasts);

    // Create choreography
    const choreography = this.choreographyRepository.create({
      ...createChoreographyDto,
      gymnasts: savedGymnasts,
    });

    const result = await this.choreographyRepository.save(choreography);
    this.logger.log(`Created choreography: ${result.name} for country: ${result.country}`);
    
    return result;
  }

  async findAll(): Promise<Choreography[]> {
    return this.choreographyRepository.find({
      relations: ['gymnasts'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCountry(country: string): Promise<Choreography[]> {
    return this.choreographyRepository.find({
      where: { country: country.toUpperCase() },
      relations: ['gymnasts'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Choreography> {
    const choreography = await this.choreographyRepository.findOne({
      where: { id },
      relations: ['gymnasts'],
    });

    if (!choreography) {
      throw new NotFoundException(`Choreography with ID ${id} not found`);
    }

    return choreography;
  }

  async update(id: string, updateChoreographyDto: UpdateChoreographyDto): Promise<Choreography> {
    const choreography = await this.findOne(id);

    // If gymnasts are being updated, validate them
    if (updateChoreographyDto.gymnastFigIds) {
      await this.validateBusinessRules({
        ...choreography,
        ...updateChoreographyDto,
      } as CreateChoreographyDto);

      const gymnasts = await this.fetchAndValidateGymnasts(updateChoreographyDto.gymnastFigIds);
      const savedGymnasts = await this.upsertGymnasts(gymnasts);
      choreography.gymnasts = savedGymnasts;
    }

    // Update other fields
    Object.assign(choreography, updateChoreographyDto);

    const result = await this.choreographyRepository.save(choreography);
    this.logger.log(`Updated choreography: ${result.name}`);
    
    return result;
  }

  async remove(id: string): Promise<void> {
    const choreography = await this.findOne(id);
    await this.choreographyRepository.remove(choreography);
    this.logger.log(`Deleted choreography: ${choreography.name}`);
  }

  private async validateBusinessRules(dto: CreateChoreographyDto): Promise<void> {
    // Check choreography limit per country per category (max 4)
    const existingCount = await this.choreographyRepository.count({
      where: {
        country: dto.country.toUpperCase(),
        category: dto.category,
      },
    });

    if (existingCount >= 4) {
      throw new BadRequestException(
        `Maximum 4 choreographies allowed per country per category. ${dto.country} already has ${existingCount} in ${dto.category} category.`
      );
    }

    // Validate gymnast count matches choreography type
    this.validateChoreographyType(dto.gymnastCount, dto.type);
  }

  private validateChoreographyType(gymnastCount: number, type: ChoreographyType): void {
    const validCombinations = {
      [ChoreographyType.INDIVIDUAL]: [1],
      [ChoreographyType.MIXED_PAIR]: [2],
      [ChoreographyType.TRIO]: [3],
      [ChoreographyType.GROUP]: [5],
      [ChoreographyType.PLATFORM]: [8],
    };

    if (!validCombinations[type].includes(gymnastCount)) {
      throw new BadRequestException(
        `Invalid gymnast count ${gymnastCount} for choreography type ${type}`
      );
    }
  }

  private async fetchAndValidateGymnasts(figIds: string[]) {
    const gymnasts = [];
    
    for (const figId of figIds) {
      const gymnast = await this.figApiService.getGymnastByFigId(figId);
      if (!gymnast) {
        throw new BadRequestException(`Gymnast with FIG ID ${figId} not found`);
      }
      if (!gymnast.isLicensed) {
        throw new BadRequestException(`Gymnast ${gymnast.firstName} ${gymnast.lastName} is not licensed`);
      }
      gymnasts.push(gymnast);
    }

    return gymnasts;
  }

  private async upsertGymnasts(gymnastDtos: any[]): Promise<Gymnast[]> {
    const savedGymnasts: Gymnast[] = [];

    for (const dto of gymnastDtos) {
      let gymnast: Gymnast | null = await this.gymnastRepository.findOne({
        where: { figId: dto.figId },
      });

      if (!gymnast) {
        // Create a new gymnast entity from the single DTO object
        const newGymnast = new Gymnast();
        Object.assign(newGymnast, dto);
        gymnast = newGymnast;
      } else {
        // Update existing gymnast data
        Object.assign(gymnast, dto);
      }

      savedGymnasts.push(await this.gymnastRepository.save(gymnast));
    }

    return savedGymnasts;
  }

  async getCountryStats(country: string): Promise<{
    totalChoreographies: number;
    byCategory: Record<ChoreographyCategory, number>;
  }> {
    const choreographies = await this.findByCountry(country);
    
    const stats = {
      totalChoreographies: choreographies.length,
      byCategory: {
        [ChoreographyCategory.YOUTH]: 0,
        [ChoreographyCategory.JUNIOR]: 0,
        [ChoreographyCategory.SENIOR]: 0,
      },
    };

    choreographies.forEach(choreo => {
      stats.byCategory[choreo.category]++;
    });

    return stats;
  }
} 