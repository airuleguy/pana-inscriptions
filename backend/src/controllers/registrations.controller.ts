import { Controller, Get, Query, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CoachRegistrationService } from '../services/coach-registration.service';
import { JudgeRegistrationService } from '../services/judge-registration.service';
import { ChoreographyService } from '../services/choreography.service';
import { CountryAuthGuard, CountryScoped } from '../guards/country-auth.guard';

@ApiTags('global-registrations')
@ApiBearerAuth()
@UseGuards(CountryAuthGuard)
@Controller('registrations')
export class GlobalRegistrationsController {
  private readonly logger = new Logger(GlobalRegistrationsController.name);

  constructor(
    private readonly coachRegistrationService: CoachRegistrationService,
    private readonly judgeRegistrationService: JudgeRegistrationService,
    private readonly choreographyService: ChoreographyService,
  ) {}

  @Get('judges')
  @CountryScoped()
  @ApiOperation({ 
    summary: 'Get judge registrations across tournaments',
    description: 'Retrieve judge registrations for your country with cross-tournament filtering capabilities'
  })
  @ApiQuery({ name: 'tournament', required: false, description: 'Filter by tournament ID' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by judge category' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Judge registrations retrieved successfully'
  })
  async getAllJudgeRegistrations(
    @Req() request: Request,
    @Query('tournament') tournamentId?: string,
    @Query('category') category?: string
  ) {
    const country = (request as any).userCountry;
    this.logger.log(`Getting global judge registrations for ${country} with filters: tournament=${tournamentId}, category=${category}`);
    return this.judgeRegistrationService.findAll(country, tournamentId);
  }

  @Get('coaches')
  @CountryScoped()
  @ApiOperation({ 
    summary: 'Get coach registrations across tournaments',
    description: 'Retrieve coach registrations for your country with cross-tournament filtering capabilities'
  })
  @ApiQuery({ name: 'tournament', required: false, description: 'Filter by tournament ID' })
  @ApiQuery({ name: 'level', required: false, description: 'Filter by coach level' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Coach registrations retrieved successfully'
  })
  async getAllCoachRegistrations(
    @Req() request: Request,
    @Query('tournament') tournamentId?: string,
    @Query('level') level?: string
  ) {
    const country = (request as any).userCountry;
    this.logger.log(`Getting global coach registrations for ${country} with filters: tournament=${tournamentId}, level=${level}`);
    return this.coachRegistrationService.findAll(country, tournamentId);
  }

  @Get('choreographies')
  @CountryScoped()
  @ApiOperation({ 
    summary: 'Get choreography registrations across tournaments',
    description: 'Retrieve choreography registrations for your country with cross-tournament filtering capabilities'
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (YOUTH, JUNIOR, SENIOR)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type (MIND, WIND, MXP, TRIO, GRP, DNCE)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Choreography registrations retrieved successfully'
  })
  async getAllChoreographyRegistrations(
    @Req() request: Request,
    @Query('category') category?: string,
    @Query('type') type?: string
  ) {
    const country = (request as any).userCountry;
    this.logger.log(`Getting global choreography registrations for ${country} with filters: category=${category}, type=${type}`);
    
    return this.choreographyService.findByCountry(country);
  }

  @Get('summary')
  @CountryScoped()
  @ApiOperation({ 
    summary: 'Get registration summary for your country',
    description: 'Get summary statistics across all tournaments for your country'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Registration summary retrieved successfully'
  })
  async getGlobalRegistrationSummary(
    @Req() request: Request
  ) {
    const country = (request as any).userCountry;
    this.logger.log(`Getting registration summary for country: ${country}`);
    
    const [judges, coaches, choreographies] = await Promise.all([
      this.judgeRegistrationService.findAll(country),
      this.coachRegistrationService.findAll(country),
      this.choreographyService.findByCountry(country)
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
