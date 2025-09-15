import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { CreateLocalCoachDto } from '../dto/create-local-coach.dto';
import { RegistrationStatus } from '../constants/registration-status';
import { FigApiService } from './fig-api.service';
import { StorageFactory } from './storage.factory';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    private readonly figApiService: FigApiService,
    private readonly storageFactory: StorageFactory,
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

  /**
   * Uploads an image for a coach
   * @param id The ID of the coach
   * @param imageBuffer The image file buffer
   * @returns The updated coach entity
   */
  async uploadImage(id: string, imageBuffer: Buffer): Promise<Coach> {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach) {
      throw new NotFoundException(`Coach with ID ${id} not found`);
    }

    // Only allow uploading images for local coaches
    if (!coach.isLocal) {
      throw new BadRequestException('Cannot upload images for FIG API coaches');
    }

    // Delete existing image if present
    if (coach.imageUrl) {
      try {
        await this.storageFactory.getStorage().deleteFile(coach.imageUrl);
      } catch (error) {
        // Log error but continue with new upload
        this.logger.error(`Failed to delete existing image for coach ${id}:`, error);
      }
    }

    // Validate image buffer
    if (!this.isValidImageBuffer(imageBuffer)) {
      throw new BadRequestException('Invalid image format. Only JPEG, PNG, and GIF are supported.');
    }

    // Upload new image
    const imageUrl = await this.storageFactory.getStorage().uploadFile(
      imageBuffer,
      'coaches',
      coach.id,
    );

    // Update coach record
    coach.imageUrl = imageUrl;
    const savedCoach = await this.coachRepository.save(coach);
    return savedCoach;
  }

  /**
   * Validates if the buffer contains a valid image
   * @param buffer The image buffer to validate
   * @returns True if valid image, false otherwise
   */
  private isValidImageBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length === 0) {
      return false;
    }

    // Check for JPEG magic bytes
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return true;
    }

    // Check for PNG magic bytes
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true;
    }

    // Check for GIF magic bytes
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return true;
    }

    return false;
  }
}
