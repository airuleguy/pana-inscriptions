import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament, TournamentType } from '../entities/tournament.entity';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);

  constructor(
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const tournament = this.tournamentRepository.create(createTournamentDto);
    const result = await this.tournamentRepository.save(tournament);
    
    this.logger.log(`Created tournament: ${result.name} (${result.type})`);
    return result;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournamentRepository.find({
      order: { startDate: 'DESC' },
      relations: ['choreographies'],
    });
  }

  async findActive(): Promise<Tournament[]> {
    return this.tournamentRepository.find({
      where: { isActive: true },
      order: { startDate: 'DESC' },
      relations: ['choreographies'],
    });
  }

  async findByType(type: TournamentType): Promise<Tournament[]> {
    return this.tournamentRepository.find({
      where: { type },
      order: { startDate: 'DESC' },
      relations: ['choreographies'],
    });
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id },
      relations: ['choreographies', 'choreographies.gymnasts'],
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }

    return tournament;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.findOne(id);
    Object.assign(tournament, updateTournamentDto);
    
    const result = await this.tournamentRepository.save(tournament);
    this.logger.log(`Updated tournament: ${result.name}`);
    
    return result;
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    await this.tournamentRepository.remove(tournament);
    this.logger.log(`Deleted tournament: ${tournament.name}`);
  }

  async getTournamentStats(id: string): Promise<{
    totalChoreographies: number;
    choreographiesByCategory: Record<string, number>;
    choreographiesByType: Record<string, number>;
    countriesParticipating: string[];
  }> {
    const tournament = await this.findOne(id);
    
    const stats = {
      totalChoreographies: tournament.choreographies.length,
      choreographiesByCategory: {},
      choreographiesByType: {},
      countriesParticipating: [],
    };

    const countries = new Set<string>();
    
    tournament.choreographies.forEach(choreo => {
      // Count by category
      stats.choreographiesByCategory[choreo.category] = 
        (stats.choreographiesByCategory[choreo.category] || 0) + 1;
      
      // Count by type
      stats.choreographiesByType[choreo.type] = 
        (stats.choreographiesByType[choreo.type] || 0) + 1;
      
      // Collect countries
      countries.add(choreo.country);
    });

    stats.countriesParticipating = Array.from(countries).sort();
    
    return stats;
  }
} 