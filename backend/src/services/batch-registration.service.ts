import { Injectable, Logger } from '@nestjs/common';
import { ChoreographyService } from './choreography.service';
import { CoachRegistrationService } from './coach-registration.service';
import { JudgeRegistrationService } from './judge-registration.service';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';
import { UpdateRegistrationStatusDto, BatchStatusUpdateDto } from '../dto/update-registration-status.dto';
import { RegistrationStatus } from '../constants/registration-status';
import { SupportRegistrationService } from './support-registration.service';

@Injectable()
export class BatchRegistrationService {
  private readonly logger = new Logger(BatchRegistrationService.name);

  constructor(
    private readonly choreographyService: ChoreographyService,
    private readonly coachRegistrationService: CoachRegistrationService,
    private readonly judgeRegistrationService: JudgeRegistrationService,
    private readonly supportRegistrationService: SupportRegistrationService,
  ) {}

  /**
   * Get existing registrations for a country and tournament
   */
  async getExistingRegistrations(country: string, tournamentId: string) {
    this.logger.log(`Getting existing registrations for country: ${country}, tournament: ${tournamentId}`);

    try {
      const [choreographies, coaches, judges, supportStaff] = await Promise.all([
        this.choreographyService.findAll(),
        this.coachRegistrationService.findAll(country, tournamentId),
        this.judgeRegistrationService.findAll(country, tournamentId),
        this.supportRegistrationService.findAll(country, tournamentId),
      ]);

      // Filter choreographies by country and tournament
      const filteredChoreographies = choreographies.filter(c => 
        c.country === country && c.tournament.id === tournamentId
      );

      return {
        choreographies: filteredChoreographies,
        coaches,
        judges,
        supportStaff,
        totals: {
          choreographies: filteredChoreographies.length,
          coaches: coaches.length,
          judges: judges.length,
          supportStaff: supportStaff.length,
          total: filteredChoreographies.length + coaches.length + judges.length + supportStaff.length,
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

  /**
   * Get registrations filtered by status
   */
  async getRegistrationsByStatus(
    country: string, 
    tournamentId: string, 
    status: RegistrationStatus
  ) {
    this.logger.log(`Getting ${status} registrations for country: ${country}, tournament: ${tournamentId}`);

    try {
      const [choreographies, coaches, judges, supportStaff] = await Promise.all([
        this.choreographyService.findByStatus(status, country, tournamentId),
        this.coachRegistrationService.findByStatus(status, country, tournamentId),
        this.judgeRegistrationService.findByStatus(status, country, tournamentId),
        this.supportRegistrationService.findByStatus(status, country, tournamentId),
      ]);

      return {
        choreographies,
        coaches,
        judges,
        supportStaff,
        totals: {
          choreographies: choreographies.length,
          coaches: coaches.length,
          judges: judges.length,
          supportStaff: supportStaff.length,
          total: choreographies.length + coaches.length + judges.length + supportStaff.length,
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get registrations by status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit all pending registrations for a country and tournament
   */
  async submitAllPendingRegistrations(
    country: string, 
    tournamentId: string, 
    notes?: string
  ): Promise<{
    success: boolean;
    updated: {
      choreographies: number;
      coaches: number;
      judges: number;
      supportStaff: number;
      total: number;
    };
    errors?: string[];
  }> {
    this.logger.log(`Submitting all pending registrations for country: ${country}, tournament: ${tournamentId}`);

    const errors: string[] = [];
    let updatedCounts = {
      choreographies: 0,
      coaches: 0,
      judges: 0,
      supportStaff: 0,
      total: 0,
    };

    try {
      // Update choreographies
      const choreographyCount = await this.choreographyService.updateStatusBatch(
        RegistrationStatus.PENDING,
        RegistrationStatus.SUBMITTED,
        country,
        tournamentId,
        notes
      );
      updatedCounts.choreographies = choreographyCount;

      // Update coaches
      const coachCount = await this.coachRegistrationService.updateStatusBatch(
        RegistrationStatus.PENDING,
        RegistrationStatus.SUBMITTED,
        country,
        tournamentId,
        notes
      );
      updatedCounts.coaches = coachCount;

      // Update judges
      const judgeCount = await this.judgeRegistrationService.updateStatusBatch(
        RegistrationStatus.PENDING,
        RegistrationStatus.SUBMITTED,
        country,
        tournamentId,
        notes
      );
      updatedCounts.judges = judgeCount;

      // Update support staff
      const supportCount = await this.supportRegistrationService.updateStatusBatch(
        RegistrationStatus.PENDING,
        RegistrationStatus.SUBMITTED,
        country,
        tournamentId,
        notes
      );
      updatedCounts.supportStaff = supportCount;

      updatedCounts.total = updatedCounts.choreographies + updatedCounts.coaches + updatedCounts.judges + updatedCounts.supportStaff;

      this.logger.log(`Successfully submitted ${updatedCounts.total} registrations`);

      return {
        success: errors.length === 0,
        updated: updatedCounts,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      this.logger.error(`Failed to submit pending registrations: ${error.message}`);
      errors.push(`Failed to submit registrations: ${error.message}`);
      
      return {
        success: false,
        updated: updatedCounts,
        errors
      };
    }
  }

  /**
   * Update specific registrations status (for admin approval)
   */
  async updateRegistrationsStatus(
    registrationIds: string[],
    status: RegistrationStatus,
    notes?: string
  ): Promise<{
    success: boolean;
    updated: number;
    errors?: string[];
  }> {
    this.logger.log(`Updating ${registrationIds.length} registrations to status: ${status}`);

    const errors: string[] = [];
    let updatedCount = 0;

    try {
      // Note: This is a simplified approach. In a production system, you might want
      // to batch update by type (choreography, coach, judge) more efficiently
      for (const id of registrationIds) {
        try {
          // Try updating in each service (one will succeed, others will silently fail)
          const choreographyUpdated = await this.choreographyService.updateStatus(id, status, notes);
          const coachUpdated = await this.coachRegistrationService.updateStatus(id, status, notes);
          const judgeUpdated = await this.judgeRegistrationService.updateStatus(id, status, notes);
          
          if (choreographyUpdated || coachUpdated || judgeUpdated) {
            updatedCount++;
          }
        } catch (error) {
          errors.push(`Failed to update registration ${id}: ${error.message}`);
        }
      }

      this.logger.log(`Successfully updated ${updatedCount}/${registrationIds.length} registrations`);

      return {
        success: errors.length === 0,
        updated: updatedCount,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      this.logger.error(`Failed to update registrations status: ${error.message}`);
      throw error;
    }
  }
} 