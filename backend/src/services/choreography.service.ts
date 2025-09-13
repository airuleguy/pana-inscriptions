import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choreography, ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';
import { Gymnast } from '../entities/gymnast.entity';
import { Tournament } from '../entities/tournament.entity';
import { ITournament } from '../entities/types/tournament.interface';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { UpdateChoreographyDto } from '../dto/update-choreography.dto';
import { FigApiService } from './fig-api.service';
import { GymnastService } from './gymnast.service';
import { BusinessRulesFactory } from '../utils/business-rules/business-rules-factory';
import { CreateChoreographyRequest } from '../utils/business-rules/base-business-rules.interface';
import { RegistrationStatus } from '../constants/registration-status';

@Injectable()
export class ChoreographyService {
  private readonly logger = new Logger(ChoreographyService.name);

  constructor(
    @InjectRepository(Choreography)
    private choreographyRepository: Repository<Choreography>,
    @InjectRepository(Gymnast)
    private gymnastRepository: Repository<Gymnast>,
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    private figApiService: FigApiService,
    private gymnastService: GymnastService,
    private businessRulesFactory: BusinessRulesFactory,
  ) {}

  async create(createChoreographyDto: CreateChoreographyDto): Promise<Choreography> {
    // Validate gymnast FIG IDs before processing
    this.validateGymnastFigIds(createChoreographyDto.gymnastFigIds);

    // Get and validate tournament
    const tournament = await this.tournamentRepository.findOne({
      where: { id: createChoreographyDto.tournamentId }
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${createChoreographyDto.tournamentId} not found`);
    }

    // Validate business rules using strategy pattern
    await this.validateBusinessRules(createChoreographyDto, tournament);

    // Fetch and validate gymnasts from FIG API
    const gymnasts = await this.fetchAndValidateGymnasts(createChoreographyDto.gymnastFigIds);

    // Create or update gymnast entities
    const savedGymnasts = await this.upsertGymnasts(gymnasts);

    // Create choreography
    const choreography = this.choreographyRepository.create({
      ...createChoreographyDto,
      tournament,
      gymnasts: savedGymnasts,
    });

    const result = await this.choreographyRepository.save(choreography);
    this.logger.log(`Created choreography: ${result.name} for country: ${result.country} in tournament: ${tournament.name}`);
    
    // Return the saved choreography with all relations populated
    return this.findOne(result.id);
  }

  async findAll(): Promise<Choreography[]> {
    return await this.choreographyRepository.find({
      relations: ['gymnasts', 'tournament'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCountry(country: string): Promise<Choreography[]> {
    return await this.choreographyRepository.find({
      where: { country: country.toUpperCase() },
      relations: ['gymnasts', 'tournament'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Choreography> {
    const choreography = await this.choreographyRepository.findOne({
      where: { id },
      relations: ['gymnasts', 'tournament'],
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
      const tournament = choreography.tournament;
      await this.validateBusinessRules({
        ...choreography,
        ...updateChoreographyDto,
        tournamentId: tournament.id,
      } as CreateChoreographyDto, tournament);

      const gymnasts = await this.fetchAndValidateGymnasts(updateChoreographyDto.gymnastFigIds);
      const savedGymnasts = await this.upsertGymnasts(gymnasts);
      choreography.gymnasts = savedGymnasts;
    }

    // Update other fields
    Object.assign(choreography, updateChoreographyDto);

    const result = await this.choreographyRepository.save(choreography);
    this.logger.log(`Updated choreography: ${result.name}`);
    
    // Return the updated choreography with all relations populated
    return this.findOne(result.id);
  }

  async remove(id: string): Promise<void> {
    const choreography = await this.findOne(id);
    await this.choreographyRepository.remove(choreography);
    this.logger.log(`Deleted choreography: ${choreography.name}`);
  }

  private async validateBusinessRules(dto: CreateChoreographyDto, tournament: ITournament): Promise<void> {
    // Get the appropriate business rules strategy for this tournament
    const strategy = this.businessRulesFactory.getStrategy(tournament.type);

    // Count existing choreographies for this country, category, type, and tournament
    const existingCount = await this.choreographyRepository.count({
      where: {
        country: dto.country.toUpperCase(),
        category: dto.category,
        type: dto.type,
        tournament: { id: tournament.id },
      },
    });

    // Create the request object for strategy validation
    const request: CreateChoreographyRequest = {
      country: dto.country,
      category: dto.category,
      type: dto.type,
      gymnastCount: dto.gymnastCount,
      gymnastFigIds: dto.gymnastFigIds,
      tournamentId: dto.tournamentId,
    };

    // Apply tournament-specific business rules
    await strategy.validateChoreographyCreation(request, existingCount);

    // Validate gymnast count matches choreography type
    this.validateChoreographyType(dto.gymnastCount, dto.type);
  }

  private validateChoreographyType(gymnastCount: number, type: ChoreographyType): void {
    const validCombinations = {
      [ChoreographyType.MIND]: [1],
      [ChoreographyType.WIND]: [1],
      [ChoreographyType.MXP]: [2],
      [ChoreographyType.TRIO]: [3],
      [ChoreographyType.GRP]: [5],
      [ChoreographyType.DNCE]: [8],
    };

    if (!validCombinations[type].includes(gymnastCount)) {
      throw new BadRequestException(
        `Invalid gymnast count ${gymnastCount} for choreography type ${type}`
      );
    }
  }

  private validateGymnastFigIds(figIds: string[]): void {
    // Check for empty or invalid FIG IDs
    const invalidIds = figIds.filter(id => !id || typeof id !== 'string' || id.trim() === '');
    
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid gymnast FIG IDs provided. Found ${invalidIds.length} empty or invalid ID(s). All gymnasts must have valid FIG IDs.`
      );
    }

    // Check for duplicates
    const uniqueIds = new Set(figIds);
    if (uniqueIds.size !== figIds.length) {
      throw new BadRequestException('Duplicate gymnast FIG IDs are not allowed in the same choreography');
    }

    // Basic format validation for FIG IDs (they should not be UUIDs)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidIds = figIds.filter(id => uuidPattern.test(id));
    
    if (uuidIds.length > 0) {
      throw new BadRequestException(
        `Invalid FIG IDs detected. Found ${uuidIds.length} UUID format ID(s) instead of FIG IDs. Please ensure you are sending FIG IDs, not database IDs.`
      );
    }
  }

  private async fetchAndValidateGymnasts(figIds: string[]) {
    const gymnasts = [];
    
    for (const figId of figIds) {
      const gymnast = await this.gymnastService.findByFigId(figId);
      if (!gymnast) {
        throw new BadRequestException(`Gymnast with FIG ID ${figId} not found`);
      }
      
      // For local gymnasts, we'll allow them even if license is not valid
      // as per the requirement: "mark it as 'to check' always"
      if (!gymnast.isLocal && !gymnast.licenseValid) {
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
        // Exclude the id field to prevent empty string UUID issues
        const { id, ...dtoWithoutId } = dto;
        Object.assign(newGymnast, dtoWithoutId);
        gymnast = newGymnast;
      } else {
        // Update existing gymnast data (excluding id to prevent overwriting existing UUID)
        const { id, ...dtoWithoutId } = dto;
        Object.assign(gymnast, dtoWithoutId);
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
        [ChoreographyCategory.NATDEV]: 0,
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

  /**
   * Find choreographies by status
   */
  async findByStatus(
    status: RegistrationStatus, 
    country?: string, 
    tournamentId?: string
  ): Promise<Choreography[]> {
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



  /**
   * Update choreography registration status
   */
  async updateStatus(
    id: string, 
    status: RegistrationStatus, 
    notes?: string
  ): Promise<boolean> {
    try {
      const choreography = await this.choreographyRepository.findOne({ where: { id } });
      
      if (!choreography) {
        return false; // Choreography not found, return false instead of throwing
      }

      choreography.status = status;
      if (notes) {
        choreography.notes = notes;
      }

      await this.choreographyRepository.save(choreography);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Batch update choreography registrations status
   */
  async updateStatusBatch(
    fromStatus: RegistrationStatus,
    toStatus: RegistrationStatus,
    country?: string,
    tournamentId?: string,
    notes?: string
  ): Promise<number> {
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
} 