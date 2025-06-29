import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Judge } from '../entities/judge.entity';
import { Tournament } from '../entities/tournament.entity';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';
import { RegistrationStatus } from '../constants/registration-status';

@Injectable()
export class JudgeRegistrationService {
  constructor(
    @InjectRepository(Judge)
    private readonly judgeRepository: Repository<Judge>,
    @InjectRepository(Tournament)
    private readonly tournamentRepository: Repository<Tournament>,
  ) {}

  /**
   * Register a judge for a tournament
   */
  async create(createJudgeDto: CreateJudgeRegistrationDto): Promise<Judge> {
    // Verify tournament exists
    const tournament = await this.tournamentRepository.findOne({
      where: { id: createJudgeDto.tournamentId }
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${createJudgeDto.tournamentId} not found`);
    }

    // Check if judge is already registered for this tournament
    const existingRegistration = await this.judgeRepository.findOne({
      where: {
        figId: createJudgeDto.figId,
        tournament: { id: createJudgeDto.tournamentId }
      }
    });

    if (existingRegistration) {
      throw new BadRequestException(`Judge ${createJudgeDto.figId} is already registered for this tournament`);
    }

    // Create judge registration
    const judge = this.judgeRepository.create({
      ...createJudgeDto,
      tournament,
    });

    return await this.judgeRepository.save(judge);
  }

  /**
   * Get all judge registrations with optional filters
   */
  async findAll(country?: string, tournamentId?: string): Promise<Judge[]> {
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

  /**
   * Get judge registration by ID
   */
  async findOne(id: string): Promise<Judge> {
    const judge = await this.judgeRepository.findOne({
      where: { id },
      relations: ['tournament']
    });

    if (!judge) {
      throw new NotFoundException(`Judge registration with ID ${id} not found`);
    }

    return judge;
  }

  /**
   * Update judge registration
   */
  async update(id: string, updateData: Partial<CreateJudgeRegistrationDto>): Promise<Judge> {
    const judge = await this.findOne(id);

    if (updateData.tournamentId && updateData.tournamentId !== judge.tournament.id) {
      const tournament = await this.tournamentRepository.findOne({
        where: { id: updateData.tournamentId }
      });

      if (!tournament) {
        throw new NotFoundException(`Tournament with ID ${updateData.tournamentId} not found`);
      }

      judge.tournament = tournament;
    }

    Object.assign(judge, updateData);
    return await this.judgeRepository.save(judge);
  }

  /**
   * Remove judge registration
   */
  async remove(id: string): Promise<void> {
    const judge = await this.findOne(id);
    await this.judgeRepository.remove(judge);
  }

  /**
   * Get registration statistics by country
   */
  async getCountryStats(country: string): Promise<{
    totalJudges: number;
    byTournament: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const judges = await this.findAll(country);

    const byTournament = judges.reduce((acc, judge) => {
      const tournamentName = judge.tournament.name;
      acc[tournamentName] = (acc[tournamentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = judges.reduce((acc, judge) => {
      const category = judge.categoryDescription;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalJudges: judges.length,
      byTournament,
      byCategory,
    };
  }

  /**
   * Find judges by status
   */
  async findByStatus(
    status: RegistrationStatus, 
    country?: string, 
    tournamentId?: string
  ): Promise<Judge[]> {
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

  /**
   * Update judge registration status
   */
  async updateStatus(
    id: string, 
    status: RegistrationStatus, 
    notes?: string
  ): Promise<boolean> {
    try {
      const judge = await this.judgeRepository.findOne({ where: { id } });
      
      if (!judge) {
        return false; // Judge not found, return false instead of throwing
      }

      judge.status = status;
      if (notes) {
        judge.notes = notes;
      }

      await this.judgeRepository.save(judge);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Batch update judge registrations status
   */
  async updateStatusBatch(
    fromStatus: RegistrationStatus,
    toStatus: RegistrationStatus,
    country?: string,
    tournamentId?: string,
    notes?: string
  ): Promise<number> {
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
} 