import { Injectable, Logger } from '@nestjs/common';
import { ChoreographyService } from './choreography.service';
import { CoachRegistrationService } from './coach-registration.service';
import { JudgeRegistrationService } from './judge-registration.service';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';

@Injectable()
export class BatchRegistrationService {
  private readonly logger = new Logger(BatchRegistrationService.name);

  constructor(
    private readonly choreographyService: ChoreographyService,
    private readonly coachRegistrationService: CoachRegistrationService,
    private readonly judgeRegistrationService: JudgeRegistrationService,
  ) {}

  /**
   * Get existing registrations for a country and tournament
   */
  async getExistingRegistrations(country: string, tournamentId: string) {
    this.logger.log(`Getting existing registrations for country: ${country}, tournament: ${tournamentId}`);

    try {
      const [choreographies, coaches, judges] = await Promise.all([
        this.choreographyService.findAll(),
        this.coachRegistrationService.findAll(country, tournamentId),
        this.judgeRegistrationService.findAll(country, tournamentId),
      ]);

      // Filter choreographies by country and tournament
      const filteredChoreographies = choreographies.filter(c => 
        c.country === country && c.tournament.id === tournamentId
      );

      return {
        choreographies: filteredChoreographies,
        coaches,
        judges,
        totals: {
          choreographies: filteredChoreographies.length,
          coaches: coaches.length,
          judges: judges.length,
          total: filteredChoreographies.length + coaches.length + judges.length,
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get existing registrations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get registration summary for a country and tournament
   */
  async getRegistrationSummary(country: string, tournamentId: string) {
    const existingRegistrations = await this.getExistingRegistrations(country, tournamentId);
    
    return {
      ...existingRegistrations,
      summary: {
        country,
        tournamentId,
        lastUpdated: new Date(),
        registrationStatus: 'IN_PROGRESS',
      }
    };
  }

  /**
   * Process batch registration for choreographies, coaches, and judges
   */
  async processBatchRegistration(batchDto: BatchRegistrationDto): Promise<BatchRegistrationResponseDto> {
    const results: BatchRegistrationResponseDto['results'] = {
      choreographies: [],
      coaches: [],
      judges: [],
    };
    const errors: string[] = [];

    this.logger.log(`Processing batch registration for country: ${batchDto.country}, tournament: ${batchDto.tournament.name}`);

    // Process choreographies
    if (batchDto.choreographies && batchDto.choreographies.length > 0) {
      this.logger.log(`Processing ${batchDto.choreographies.length} choreographies`);
      for (const choreographyDto of batchDto.choreographies) {
        try {
          const choreography = await this.choreographyService.create(choreographyDto);
          results.choreographies.push(choreography);
          this.logger.log(`Successfully registered choreography: ${choreography.name}`);
        } catch (error) {
          const errorMessage = `Failed to register choreography "${choreographyDto.name}": ${error.message}`;
          this.logger.error(errorMessage);
          errors.push(errorMessage);
        }
      }
    }

    // Process coaches
    if (batchDto.coaches && batchDto.coaches.length > 0) {
      this.logger.log(`Processing ${batchDto.coaches.length} coaches`);
      for (const coachData of batchDto.coaches as any[]) {
        try {
          // Transform frontend coach data to registration DTO
          const coachRegistrationDto: CreateCoachRegistrationDto = {
            figId: coachData.id,
            firstName: coachData.firstName,
            lastName: coachData.lastName,
            fullName: coachData.fullName,
            gender: coachData.gender,
            country: coachData.country,
            level: coachData.level,
            levelDescription: coachData.levelDescription,
            tournamentId: batchDto.tournament.id,
          };

          const coach = await this.coachRegistrationService.create(coachRegistrationDto);
          results.coaches.push(coach);
          this.logger.log(`Successfully registered coach: ${coach.fullName}`);
        } catch (error) {
          const errorMessage = `Failed to register coach "${coachData.fullName}": ${error.message}`;
          this.logger.error(errorMessage);
          errors.push(errorMessage);
        }
      }
    }

    // Process judges
    if (batchDto.judges && batchDto.judges.length > 0) {
      this.logger.log(`Processing ${batchDto.judges.length} judges`);
      for (const judgeData of batchDto.judges as any[]) {
        try {
          // Transform frontend judge data to registration DTO
          const judgeRegistrationDto: CreateJudgeRegistrationDto = {
            figId: judgeData.id,
            firstName: judgeData.firstName,
            lastName: judgeData.lastName,
            fullName: judgeData.fullName,
            birth: judgeData.birth,
            gender: judgeData.gender,
            country: judgeData.country,
            category: judgeData.category,
            categoryDescription: judgeData.categoryDescription,
            tournamentId: batchDto.tournament.id,
          };

          const judge = await this.judgeRegistrationService.create(judgeRegistrationDto);
          results.judges.push(judge);
          this.logger.log(`Successfully registered judge: ${judge.fullName}`);
        } catch (error) {
          const errorMessage = `Failed to register judge "${judgeData.fullName}": ${error.message}`;
          this.logger.error(errorMessage);
          errors.push(errorMessage);
        }
      }
    }

    const totalRegistered = results.choreographies.length + results.coaches.length + results.judges.length;
    const totalAttempted = (batchDto.choreographies?.length || 0) + (batchDto.coaches?.length || 0) + (batchDto.judges?.length || 0);
    
    this.logger.log(`Batch registration completed: ${totalRegistered}/${totalAttempted} successful registrations`);

    const response: BatchRegistrationResponseDto = {
      success: errors.length === 0,
      results,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Get registration statistics for a tournament
   */
  async getTournamentStats(tournamentId: string): Promise<{
    choreographies: number;
    coaches: number;
    judges: number;
    total: number;
  }> {
    const [choreographies, coaches, judges] = await Promise.all([
      this.choreographyService.findAll().then(items => items.filter(c => c.tournament.id === tournamentId).length),
      this.coachRegistrationService.findAll(undefined, tournamentId).then(items => items.length),
      this.judgeRegistrationService.findAll(undefined, tournamentId).then(items => items.length),
    ]);

    return {
      choreographies,
      coaches,
      judges,
      total: choreographies + coaches + judges,
    };
  }
} 