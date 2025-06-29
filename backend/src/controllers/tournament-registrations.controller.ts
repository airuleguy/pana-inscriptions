import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CoachRegistrationService } from '../services/coach-registration.service';
import { JudgeRegistrationService } from '../services/judge-registration.service';
import { ChoreographyService } from '../services/choreography.service';
import { BatchRegistrationService } from '../services/batch-registration.service';
import { CreateCoachRegistrationDto } from '../dto/create-coach-registration.dto';
import { CreateJudgeRegistrationDto } from '../dto/create-judge-registration.dto';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { BatchRegistrationDto, BatchRegistrationResponseDto } from '../dto/batch-registration.dto';
import { Coach } from '../entities/coach.entity';
import { Judge } from '../entities/judge.entity';
import { Choreography } from '../entities/choreography.entity';

@ApiTags('tournament-registrations')
@Controller('api/v1/tournaments/:tournamentId/registrations')
export class TournamentRegistrationsController {
  private readonly logger = new Logger(TournamentRegistrationsController.name);

  constructor(
    private readonly coachRegistrationService: CoachRegistrationService,
    private readonly judgeRegistrationService: JudgeRegistrationService,
    private readonly choreographyService: ChoreographyService,
    private readonly batchRegistrationService: BatchRegistrationService,
  ) {}

  // === JUDGES ===
  @Post('judges')
  @ApiOperation({ 
    summary: 'Register judges for tournament',
    description: 'Register one or multiple judges for a specific tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Judges registered successfully',
    type: [Judge]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input or tournament-specific validation failed'
  })
  async registerJudges(
    @Param('tournamentId') tournamentId: string,
    @Body() registrationData: CreateJudgeRegistrationDto | CreateJudgeRegistrationDto[]
  ): Promise<{
    success: boolean;
    results: Judge[];
    errors?: string[];
  }> {
    const judges = Array.isArray(registrationData) ? registrationData : [registrationData];
    
    // Ensure all registrations are for the specified tournament
    judges.forEach(judge => judge.tournamentId = tournamentId);
    
    this.logger.log(`Registering ${judges.length} judge(s) for tournament: ${tournamentId}`);
    
    const results: Judge[] = [];
    const errors: string[] = [];

    for (const judgeDto of judges) {
      try {
        const judge = await this.judgeRegistrationService.create(judgeDto);
        results.push(judge);
        this.logger.log(`Successfully registered judge: ${judge.fullName}`);
      } catch (error) {
        const errorMessage = `Failed to register judge "${judgeDto.fullName}": ${error.message}`;
        this.logger.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  @Get('judges')
  @ApiOperation({ 
    summary: 'Get tournament judge registrations',
    description: 'Retrieve judge registrations for a specific tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Judge registrations retrieved successfully',
    type: [Judge]
  })
  async getTournamentJudges(
    @Param('tournamentId') tournamentId: string,
    @Query('country') country?: string
  ): Promise<Judge[]> {
    this.logger.log(`Getting judge registrations for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
    return this.judgeRegistrationService.findAll(country, tournamentId);
  }

  @Put('judges/:judgeId')
  @ApiOperation({ 
    summary: 'Update judge registration',
    description: 'Update a judge registration for a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'judgeId', description: 'Judge registration UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Judge registration updated successfully',
    type: Judge
  })
  async updateJudgeRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('judgeId') judgeId: string,
    @Body() updateData: Partial<CreateJudgeRegistrationDto>
  ): Promise<Judge> {
    // Ensure the update doesn't change the tournament
    delete updateData.tournamentId;
    this.logger.log(`Updating judge registration: ${judgeId} for tournament: ${tournamentId}`);
    return this.judgeRegistrationService.update(judgeId, updateData);
  }

  @Delete('judges/:judgeId')
  @ApiOperation({ 
    summary: 'Remove judge registration',
    description: 'Remove a judge registration from a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'judgeId', description: 'Judge registration UUID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Judge registration removed successfully'
  })
  async removeJudgeRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('judgeId') judgeId: string
  ): Promise<void> {
    this.logger.log(`Removing judge registration: ${judgeId} from tournament: ${tournamentId}`);
    return this.judgeRegistrationService.remove(judgeId);
  }

  // === COACHES ===
  @Post('coaches')
  @ApiOperation({ 
    summary: 'Register coaches for tournament',
    description: 'Register one or multiple coaches for a specific tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Coaches registered successfully',
    type: [Coach]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input or tournament-specific validation failed'
  })
  async registerCoaches(
    @Param('tournamentId') tournamentId: string,
    @Body() registrationData: CreateCoachRegistrationDto | CreateCoachRegistrationDto[]
  ): Promise<{
    success: boolean;
    results: Coach[];
    errors?: string[];
  }> {
    const coaches = Array.isArray(registrationData) ? registrationData : [registrationData];
    
    // Ensure all registrations are for the specified tournament
    coaches.forEach(coach => coach.tournamentId = tournamentId);
    
    this.logger.log(`Registering ${coaches.length} coach(es) for tournament: ${tournamentId}`);
    
    const results: Coach[] = [];
    const errors: string[] = [];

    for (const coachDto of coaches) {
      try {
        const coach = await this.coachRegistrationService.create(coachDto);
        results.push(coach);
        this.logger.log(`Successfully registered coach: ${coach.fullName}`);
      } catch (error) {
        const errorMessage = `Failed to register coach "${coachDto.fullName}": ${error.message}`;
        this.logger.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  @Get('coaches')
  @ApiOperation({ 
    summary: 'Get tournament coach registrations',
    description: 'Retrieve coach registrations for a specific tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Coach registrations retrieved successfully',
    type: [Coach]
  })
  async getTournamentCoaches(
    @Param('tournamentId') tournamentId: string,
    @Query('country') country?: string
  ): Promise<Coach[]> {
    this.logger.log(`Getting coach registrations for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
    return this.coachRegistrationService.findAll(country, tournamentId);
  }

  @Put('coaches/:coachId')
  @ApiOperation({ 
    summary: 'Update coach registration',
    description: 'Update a coach registration for a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'coachId', description: 'Coach registration UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Coach registration updated successfully',
    type: Coach
  })
  async updateCoachRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('coachId') coachId: string,
    @Body() updateData: Partial<CreateCoachRegistrationDto>
  ): Promise<Coach> {
    // Ensure the update doesn't change the tournament
    delete updateData.tournamentId;
    this.logger.log(`Updating coach registration: ${coachId} for tournament: ${tournamentId}`);
    return this.coachRegistrationService.update(coachId, updateData);
  }

  @Delete('coaches/:coachId')
  @ApiOperation({ 
    summary: 'Remove coach registration',
    description: 'Remove a coach registration from a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'coachId', description: 'Coach registration UUID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Coach registration removed successfully'
  })
  async removeCoachRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('coachId') coachId: string
  ): Promise<void> {
    this.logger.log(`Removing coach registration: ${coachId} from tournament: ${tournamentId}`);
    return this.coachRegistrationService.remove(coachId);
  }

  // === CHOREOGRAPHIES ===
  @Post('choreographies')
  @ApiOperation({ 
    summary: 'Register choreographies for tournament',
    description: 'Register one or multiple choreographies for a specific tournament with automatic tournament-specific business rule validation'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Choreographies registered successfully',
    type: [Choreography]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input or tournament business rule violation'
  })
  async registerChoreographies(
    @Param('tournamentId') tournamentId: string,
    @Body() registrationData: CreateChoreographyDto | CreateChoreographyDto[]
  ): Promise<{
    success: boolean;
    results: Choreography[];
    errors?: string[];
  }> {
    const choreographies = Array.isArray(registrationData) ? registrationData : [registrationData];
    
    // Ensure all registrations are for the specified tournament
    choreographies.forEach(choreo => choreo.tournamentId = tournamentId);
    
    this.logger.log(`Registering ${choreographies.length} choreograph(ies) for tournament: ${tournamentId}`);
    
    const results: Choreography[] = [];
    const errors: string[] = [];

    for (const choreoDto of choreographies) {
      try {
        const choreography = await this.choreographyService.create(choreoDto);
        results.push(choreography);
        this.logger.log(`Successfully registered choreography: ${choreography.name}`);
      } catch (error) {
        const errorMessage = `Failed to register choreography "${choreoDto.name}": ${error.message}`;
        this.logger.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  @Get('choreographies')
  @ApiOperation({ 
    summary: 'Get tournament choreography registrations',
    description: 'Retrieve choreography registrations for a specific tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (YOUTH, JUNIOR, SENIOR)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by choreography type (MIND, WIND, MXP, TRIO, GRP, DNCE)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Choreography registrations retrieved successfully',
    type: [Choreography]
  })
  async getTournamentChoreographies(
    @Param('tournamentId') tournamentId: string,
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('type') type?: string
  ): Promise<Choreography[]> {
    this.logger.log(`Getting choreography registrations for tournament: ${tournamentId}`);
    
    // For now, let's filter by country if provided
    // TODO: Add tournament-specific filtering to choreography service
    if (country) {
      return this.choreographyService.findByCountry(country);
    }
    return this.choreographyService.findAll();
  }

  @Put('choreographies/:choreographyId')
  @ApiOperation({ 
    summary: 'Update choreography registration',
    description: 'Update a choreography registration for a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'choreographyId', description: 'Choreography UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Choreography registration updated successfully',
    type: Choreography
  })
  async updateChoreographyRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('choreographyId') choreographyId: string,
    @Body() updateData: Partial<CreateChoreographyDto>
  ): Promise<Choreography> {
    // Ensure the update doesn't change the tournament
    delete updateData.tournamentId;
    this.logger.log(`Updating choreography registration: ${choreographyId} for tournament: ${tournamentId}`);
    return this.choreographyService.update(choreographyId, updateData);
  }

  @Delete('choreographies/:choreographyId')
  @ApiOperation({ 
    summary: 'Remove choreography registration',
    description: 'Remove a choreography registration from a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'choreographyId', description: 'Choreography UUID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Choreography registration removed successfully'
  })
  async removeChoreographyRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('choreographyId') choreographyId: string
  ): Promise<void> {
    this.logger.log(`Removing choreography registration: ${choreographyId} from tournament: ${tournamentId}`);
    return this.choreographyService.remove(choreographyId);
  }

  // === BATCH OPERATIONS ===
  @Post('batch')
  @ApiOperation({ 
    summary: 'Batch register for tournament',
    description: 'Register multiple types of entities (judges, coaches, choreographies) for a tournament in a single request with tournament-specific validation'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Batch registration completed successfully',
    type: BatchRegistrationResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data or tournament business rule violations'
  })
  async batchRegister(
    @Param('tournamentId') tournamentId: string,
    @Body() batchData: BatchRegistrationDto
  ): Promise<BatchRegistrationResponseDto> {
    // Ensure all registrations are for the specified tournament
    batchData.choreographies?.forEach(choreo => choreo.tournamentId = tournamentId);
    batchData.coaches?.forEach(coach => coach.tournamentId = tournamentId);
    batchData.judges?.forEach(judge => judge.tournamentId = tournamentId);
    
    // Update tournament info in batch data
    batchData.tournament.id = tournamentId;
    
    this.logger.log(`Processing batch registration for tournament: ${tournamentId}`);
    
    return this.batchRegistrationService.processBatchRegistration(batchData);
  }

  // === SUMMARY ENDPOINTS ===
  @Get('summary')
  @ApiOperation({ 
    summary: 'Get tournament registration summary',
    description: 'Get a comprehensive summary of all registrations for a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament registration summary retrieved successfully'
  })
  async getTournamentRegistrationSummary(
    @Param('tournamentId') tournamentId: string,
    @Query('country') country?: string
  ) {
    this.logger.log(`Getting registration summary for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
    
    if (country) {
      return this.batchRegistrationService.getRegistrationSummary(country, tournamentId);
    }
    return this.batchRegistrationService.getTournamentStats(tournamentId);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get tournament registration statistics',
    description: 'Get detailed statistics for all registrations in a tournament'
  })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament registration statistics retrieved successfully'
  })
  async getTournamentRegistrationStats(
    @Param('tournamentId') tournamentId: string
  ) {
    this.logger.log(`Getting registration statistics for tournament: ${tournamentId}`);
    return this.batchRegistrationService.getTournamentStats(tournamentId);
  }
} 