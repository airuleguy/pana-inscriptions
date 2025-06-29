import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { Tournament } from '../entities/tournament.entity';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { RegistrationStatus } from '../constants/registration-status';

@Injectable()
export class CoachRegistrationService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
  ) {}

  /**
   * Register a coach for a tournament
   */
  async create(createCoachDto: CreateCoachRegistrationDto): Promise<Coach> {
    // Verify tournament exists
    const tournament = await this.tournamentRepository.findOne({
      where: { id: createCoachDto.tournamentId }
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${createCoachDto.tournamentId} not found`);
    }

    // Check if coach is already registered for this tournament
    const existingRegistration = await this.coachRepository.findOne({
      where: {
        figId: createCoachDto.figId,
        tournament: { id: createCoachDto.tournamentId }
      }
    });

    if (existingRegistration) {
      throw new BadRequestException(`Coach ${createCoachDto.figId} is already registered for this tournament`);
    }

    // Create coach registration
    const coach = this.coachRepository.create({
      ...createCoachDto,
      tournament,
    });

    return await this.coachRepository.save(coach);
  }

  /**
   * Get all coach registrations with optional filters
   */
  async findAll(country?: string, tournamentId?: string): Promise<Coach[]> {
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

  /**
   * Get coach registration by ID
   */
  async findOne(id: string): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: ['tournament']
    });

    if (!coach) {
      throw new NotFoundException(`Coach registration with ID ${id} not found`);
    }

    return coach;
  }

  /**
   * Update coach registration
   */
  async update(id: string, updateData: Partial<CreateCoachRegistrationDto>): Promise<Coach> {
    const coach = await this.findOne(id);

    if (updateData.tournamentId && updateData.tournamentId !== coach.tournament.id) {
      const tournament = await this.tournamentRepository.findOne({
        where: { id: updateData.tournamentId }
      });

      if (!tournament) {
        throw new NotFoundException(`Tournament with ID ${updateData.tournamentId} not found`);
      }

      coach.tournament = tournament;
    }

    Object.assign(coach, updateData);
    return await this.coachRepository.save(coach);
  }

  /**
   * Remove coach registration
   */
  async remove(id: string): Promise<void> {
    const coach = await this.findOne(id);
    await this.coachRepository.remove(coach);
  }

  /**
   * Get registration statistics by country
   */
  async getCountryStats(country: string): Promise<{
    totalCoaches: number;
    byTournament: Record<string, number>;
  }> {
    const coaches = await this.findAll(country);

    const byTournament = coaches.reduce((acc, coach) => {
      const tournamentName = coach.tournament.name;
      acc[tournamentName] = (acc[tournamentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCoaches: coaches.length,
      byTournament,
    };
  }

  /**
   * Find coaches by status
   */
  async findByStatus(
    status: RegistrationStatus, 
    country?: string, 
    tournamentId?: string
  ): Promise<Coach[]> {
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

  /**
   * Update coach registration status
   */
  async updateStatus(
    id: string, 
    status: RegistrationStatus, 
    notes?: string
  ): Promise<boolean> {
    try {
      const coach = await this.coachRepository.findOne({ where: { id } });
      
      if (!coach) {
        return false; // Coach not found, return false instead of throwing
      }

      coach.status = status;
      if (notes) {
        coach.notes = notes;
      }

      await this.coachRepository.save(coach);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Batch update coach registrations status
   */
  async updateStatusBatch(
    fromStatus: RegistrationStatus,
    toStatus: RegistrationStatus,
    country?: string,
    tournamentId?: string,
    notes?: string
  ): Promise<number> {
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
} 