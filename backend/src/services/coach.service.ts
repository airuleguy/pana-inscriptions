import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { CreateLocalCoachDto } from '../dto/create-local-coach.dto';
import { RegistrationStatus } from '../constants/registration-status';
import { FigApiService } from './fig-api.service';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly figApiService: FigApiService,
  ) {}

  /**
   * Create a new local coach
   */
  async createLocal(createCoachDto: CreateLocalCoachDto): Promise<Coach> {
    // Check if coach with this FIG ID already exists
    const existingCoach = await this.coachRepository.findOne({
      where: { figId: createCoachDto.figId }
    });

    if (existingCoach) {
      throw new BadRequestException(`Coach with FIG ID ${createCoachDto.figId} already exists`);
    }

    // Create coach entity
    const coach = this.coachRepository.create({
      ...createCoachDto,
      status: RegistrationStatus.PENDING,
      isLocal: true,
      tournament: null, // Will be set when registering for a tournament
    } as Partial<Coach>);

    // Save and return the new coach
    return await this.coachRepository.save(coach);
  }

  /**
   * Get all coaches (FIG API + local) for a specific country
   */
  async findAll(country?: string): Promise<any[]> {
    // Get FIG API coaches
    const figCoaches = country 
      ? await this.figApiService.getCoachesByCountry(country)
      : await this.figApiService.getCoaches();

    // Get local coaches
    const localCoaches = await this.getLocalCoaches(country);

    // Combine and deduplicate (FIG API takes precedence)
    const figIds = new Set(figCoaches.map(c => c.id)); // CoachDto uses 'id' not 'figId'
    const uniqueLocalCoaches = localCoaches.filter(c => c.figId && !figIds.has(c.figId));

    // Transform local coaches to match FIG format
    const transformedLocalCoaches = uniqueLocalCoaches.map(coach => ({
      id: coach.figId, // Map figId to id for consistency with CoachDto
      firstName: coach.firstName,
      lastName: coach.lastName,
      fullName: coach.fullName,
      gender: coach.gender as 'MALE' | 'FEMALE',
      country: coach.country,
      discipline: 'AER', // Default discipline for aerobic gymnastics
      level: coach.level,
      levelDescription: coach.levelDescription,
      imageUrl: coach.imageUrl,
      isLocal: true,
    }));

    return [...figCoaches, ...transformedLocalCoaches];
  }

  /**
   * Get local coaches from database
   */
  private async getLocalCoaches(country?: string): Promise<Coach[]> {
    const queryBuilder = this.coachRepository.createQueryBuilder('coach');

    if (country) {
      queryBuilder.where('coach.country = :country', { country });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get coach by FIG ID
   */
  async findByFigId(figId: string): Promise<Coach | null> {
    return await this.coachRepository.findOne({
      where: { figId }
    });
  }

  /**
   * Get coach by ID
   */
  async findById(id: string): Promise<Coach | null> {
    return await this.coachRepository.findOne({
      where: { id }
    });
  }

  /**
   * Search coaches by name and country
   */
  async search(query: string, country?: string): Promise<Coach[]> {
    const queryBuilder = this.coachRepository.createQueryBuilder('coach');

    if (query) {
      queryBuilder.where(
        '(coach.firstName ILIKE :query OR coach.lastName ILIKE :query OR coach.fullName ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (country) {
      queryBuilder.andWhere('coach.country = :country', { country });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Clear FIG coach cache
   */
  async clearCache(): Promise<void> {
    await this.figApiService.clearCache();
  }
}
