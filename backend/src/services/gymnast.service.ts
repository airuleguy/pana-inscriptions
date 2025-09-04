import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gymnast } from '../entities/gymnast.entity';
import { FigApiService } from './fig-api.service';
import { GymnastDto } from '../dto/gymnast.dto';
import { CreateGymnastDto } from '../dto/create-gymnast.dto';
import { UpdateGymnastDto } from '../dto/update-gymnast.dto';
import { calculateCategory, calculateCompetitionYearAge, calculateCategoryFromDateOfBirth } from '../constants/categories';

@Injectable()
export class GymnastService {
  private readonly logger = new Logger(GymnastService.name);

  constructor(
    @InjectRepository(Gymnast)
    private gymnastRepository: Repository<Gymnast>,
    private figApiService: FigApiService,
  ) {}

  /**
   * Get all gymnasts (FIG API + local) for a specific country
   */
  async findAll(country?: string): Promise<GymnastDto[]> {
    // Get FIG API gymnasts
    const figGymnasts = country 
      ? await this.figApiService.getGymnastsByCountry(country)
      : await this.figApiService.getGymnasts();

    // Get local gymnasts
    const localGymnasts = await this.getLocalGymnasts(country);

    // Combine and deduplicate (FIG API takes precedence)
    const figIds = new Set(figGymnasts.map(g => g.figId));
    const uniqueLocalGymnasts = localGymnasts.filter(g => g.figId && !figIds.has(g.figId));

    return [...figGymnasts, ...uniqueLocalGymnasts];
  }

  /**
   * Get gymnast by FIG ID (checks both FIG API and local)
   */
  async findByFigId(figId: string): Promise<GymnastDto | null> {
    // First try FIG API
    const figGymnast = await this.figApiService.getGymnastByFigId(figId);
    if (figGymnast) {
      return figGymnast;
    }

    // Then check local database
    const localGymnast = await this.gymnastRepository.findOne({
      where: { figId },
    });

    return localGymnast ? this.transformEntityToDto(localGymnast) : null;
  }

  /**
   * Create a new local gymnast
   */
  async create(createGymnastDto: CreateGymnastDto): Promise<GymnastDto> {
    // Validate that this FIG ID doesn't already exist
    const existingGymnast = await this.findByFigId(createGymnastDto.figId);
    if (existingGymnast) {
      throw new BadRequestException(`Gymnast with FIG ID ${createGymnastDto.figId} already exists`);
    }

    // Calculate competition year age and category from date of birth
    const dateOfBirth = new Date(createGymnastDto.dateOfBirth);
    const competitionAge = calculateCompetitionYearAge(dateOfBirth);
    const category = calculateCategory(competitionAge);

    // Create gymnast entity
    const gymnast = this.gymnastRepository.create({
      ...createGymnastDto,
      dateOfBirth,
      age: competitionAge,
      category,
      fullName: `${createGymnastDto.firstName} ${createGymnastDto.lastName}`,
      discipline: 'AER', // Default to aerobic
      licenseValid: false, // Always mark as invalid for local gymnasts
      licenseExpiryDate: null, // No expiry date for local gymnasts
      isLocal: true, // Mark as locally created
    });

    const savedGymnast = await this.gymnastRepository.save(gymnast);
    this.logger.log(`Created local gymnast: ${savedGymnast.fullName} (${savedGymnast.figId})`);

    return this.transformEntityToDto(savedGymnast);
  }

  /**
   * Update a local gymnast
   */
  async update(id: string, updateGymnastDto: UpdateGymnastDto): Promise<GymnastDto> {
    const gymnast = await this.gymnastRepository.findOne({ where: { id } });
    if (!gymnast) {
      throw new NotFoundException(`Gymnast with ID ${id} not found`);
    }

    // Only allow updating local gymnasts
    if (!gymnast.isLocal) {
      throw new BadRequestException('Cannot update FIG API gymnasts');
    }

    // Update age and category if date of birth changed
    if (updateGymnastDto.dateOfBirth) {
      const dateOfBirth = new Date(updateGymnastDto.dateOfBirth);
      const competitionAge = calculateCompetitionYearAge(dateOfBirth);
      updateGymnastDto.age = competitionAge;
      updateGymnastDto.category = calculateCategory(competitionAge);
    }

    // Update full name if first or last name changed
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

  /**
   * Delete a local gymnast
   */
  async remove(id: string): Promise<void> {
    const gymnast = await this.gymnastRepository.findOne({ where: { id } });
    if (!gymnast) {
      throw new NotFoundException(`Gymnast with ID ${id} not found`);
    }

    // Only allow deleting local gymnasts
    if (!gymnast.isLocal) {
      throw new BadRequestException('Cannot delete FIG API gymnasts');
    }

    await this.gymnastRepository.remove(gymnast);
    this.logger.log(`Deleted local gymnast: ${gymnast.fullName} (${gymnast.figId})`);
  }

  /**
   * Get local gymnasts from database
   */
  private async getLocalGymnasts(country?: string): Promise<GymnastDto[]> {
    const queryBuilder = this.gymnastRepository.createQueryBuilder('gymnast')
      .where('gymnast.isLocal = :isLocal', { isLocal: true });

    if (country) {
      queryBuilder.andWhere('UPPER(gymnast.country) = UPPER(:country)', { country });
    }

    const gymnasts = await queryBuilder.getMany();
    return gymnasts.map(g => this.transformEntityToDto(g));
  }

  /**
   * Transform gymnast entity to DTO
   */
  private transformEntityToDto(gymnast: Gymnast): GymnastDto {
    // Calculate competition year age and category using centralized logic
    const competitionAge = calculateCompetitionYearAge(gymnast.dateOfBirth);
    const competitionCategory = calculateCategory(competitionAge);
    
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
      age: competitionAge,
      category: competitionCategory,
      isLocal: gymnast.isLocal,
    };
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }


  /**
   * Clear FIG API cache
   */
  async clearCache(): Promise<void> {
    return this.figApiService.clearCache();
  }
} 