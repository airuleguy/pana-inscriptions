import { Controller, Get, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CoachRegistrationService } from '../services/coach-registration.service';
import { JudgeRegistrationService } from '../services/judge-registration.service';
import { ChoreographyService } from '../services/choreography.service';

@ApiTags('global-registrations')
@Controller('api/v1/registrations')
export class GlobalRegistrationsController {
  private readonly logger = new Logger(GlobalRegistrationsController.name);

  constructor(
    private readonly coachRegistrationService: CoachRegistrationService,
    private readonly judgeRegistrationService: JudgeRegistrationService,
    private readonly choreographyService: ChoreographyService,
  ) {}

  @Get('judges')
  @ApiOperation({ 
    summary: 'Get judge registrations across tournaments',
    description: 'Retrieve judge registrations with cross-tournament filtering capabilities'
  })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiQuery({ name: 'tournament', required: false, description: 'Filter by tournament ID' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by judge category' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Judge registrations retrieved successfully'
  })
  async getAllJudgeRegistrations(
    @Query('country') country?: string,
    @Query('tournament') tournamentId?: string,
    @Query('category') category?: string
  ) {
    this.logger.log(`Getting global judge registrations with filters: country=${country}, tournament=${tournamentId}, category=${category}`);
    return this.judgeRegistrationService.findAll(country, tournamentId);
  }

  @Get('coaches')
  @ApiOperation({ 
    summary: 'Get coach registrations across tournaments',
    description: 'Retrieve coach registrations with cross-tournament filtering capabilities'
  })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiQuery({ name: 'tournament', required: false, description: 'Filter by tournament ID' })
  @ApiQuery({ name: 'level', required: false, description: 'Filter by coach level' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Coach registrations retrieved successfully'
  })
  async getAllCoachRegistrations(
    @Query('country') country?: string,
    @Query('tournament') tournamentId?: string,
    @Query('level') level?: string
  ) {
    this.logger.log(`Getting global coach registrations with filters: country=${country}, tournament=${tournamentId}, level=${level}`);
    return this.coachRegistrationService.findAll(country, tournamentId);
  }

  @Get('choreographies')
  @ApiOperation({ 
    summary: 'Get choreography registrations across tournaments',
    description: 'Retrieve choreography registrations with cross-tournament filtering capabilities'
  })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (YOUTH, JUNIOR, SENIOR)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (MIND, WIND, MXP, TRIO, GRP, DNCE)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Choreography registrations retrieved successfully'
  })
  async getAllChoreographyRegistrations(
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('type') type?: string
  ) {
    this.logger.log(`Getting global choreography registrations with filters: country=${country}, category=${category}, type=${type}`);
    
    if (country) {
      return this.choreographyService.findByCountry(country);
    }
    return this.choreographyService.findAll();
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get global registration summary',
    description: 'Get summary statistics across all tournaments and countries'
  })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country code (ISO 3166-1 alpha-3)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Global registration summary retrieved successfully'
  })
  async getGlobalRegistrationSummary(
    @Query('country') country?: string
  ) {
    this.logger.log(`Getting global registration summary${country ? ` for country: ${country}` : ''}`);
    
    const [judges, coaches, choreographies] = await Promise.all([
      this.judgeRegistrationService.findAll(country),
      this.coachRegistrationService.findAll(country),
      country ? this.choreographyService.findByCountry(country) : this.choreographyService.findAll()
    ]);

    // Group by tournament
    const tournamentStats = {};
    
    judges.forEach(judge => {
      const tournamentId = judge.tournament?.id || 'unknown';
      if (!tournamentStats[tournamentId]) {
        tournamentStats[tournamentId] = { judges: 0, coaches: 0, choreographies: 0, tournamentName: judge.tournament?.name };
      }
      tournamentStats[tournamentId].judges++;
    });

    coaches.forEach(coach => {
      const tournamentId = coach.tournament?.id || 'unknown';
      if (!tournamentStats[tournamentId]) {
        tournamentStats[tournamentId] = { judges: 0, coaches: 0, choreographies: 0, tournamentName: coach.tournament?.name };
      }
      tournamentStats[tournamentId].coaches++;
    });

    choreographies.forEach(choreo => {
      const tournamentId = choreo.tournament?.id || 'unknown';
      if (!tournamentStats[tournamentId]) {
        tournamentStats[tournamentId] = { judges: 0, coaches: 0, choreographies: 0, tournamentName: choreo.tournament?.name };
      }
      tournamentStats[tournamentId].choreographies++;
    });

    return {
      totals: {
        judges: judges.length,
        coaches: coaches.length,
        choreographies: choreographies.length
      },
      byTournament: tournamentStats
    };
  }
}
