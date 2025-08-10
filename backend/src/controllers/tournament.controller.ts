import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TournamentService } from '../services/tournament.service';
import { BatchRegistrationService } from '../services/batch-registration.service';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { Tournament, TournamentType } from '../entities/tournament.entity';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentController {
  private readonly logger = new Logger(TournamentController.name);

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly batchRegistrationService: BatchRegistrationService,
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new tournament',
    description: 'Create a new tournament with specified dates and location'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Tournament created successfully',
    type: Tournament
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data'
  })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.create(createTournamentDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all tournaments',
    description: 'Retrieve all tournaments, optionally filter by active status'
  })
  @ApiQuery({ 
    name: 'active', 
    required: false, 
    description: 'Filter by active status (true/false)',
    example: 'true'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournaments retrieved successfully',
    type: [Tournament]
  })
  findAll(@Query('active') activeOnly?: string) {
    if (activeOnly === 'true') {
      return this.tournamentService.findActive();
    }
    return this.tournamentService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ 
    summary: 'Get upcoming tournaments',
    description: 'Retrieve active tournaments that are ongoing or starting within the next 6 months'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Upcoming tournaments retrieved successfully',
    type: [Tournament]
  })
  findUpcoming() {
    return this.tournamentService.findUpcoming();
  }

  @Get('by-type/:type')
  @ApiOperation({ 
    summary: 'Get tournaments by type',
    description: 'Retrieve tournaments filtered by tournament type'
  })
  @ApiParam({ 
    name: 'type', 
    description: 'Tournament type',
    enum: TournamentType
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournaments retrieved successfully',
    type: [Tournament]
  })
  findByType(@Param('type') type: TournamentType) {
    return this.tournamentService.findByType(type);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get tournament by ID',
    description: 'Retrieve a specific tournament with its choreographies'
  })
  @ApiParam({ name: 'id', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament retrieved successfully',
    type: Tournament
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tournament not found'
  })
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: 'Get tournament statistics',
    description: 'Retrieve detailed statistics for a specific tournament'
  })
  @ApiParam({ name: 'id', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament statistics retrieved successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tournament not found'
  })
  getTournamentStats(@Param('id') id: string) {
    return this.tournamentService.getTournamentStats(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update tournament',
    description: 'Update tournament details'
  })
  @ApiParam({ name: 'id', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament updated successfully',
    type: Tournament
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tournament not found'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data'
  })
  update(@Param('id') id: string, @Body() updateTournamentDto: UpdateTournamentDto) {
    return this.tournamentService.update(id, updateTournamentDto);
  }

  @Get(':id/registrations')
  @ApiOperation({ 
    summary: 'Get tournament registrations',
    description: 'Retrieve all registrations for a specific tournament'
  })
  @ApiParam({ name: 'id', description: 'Tournament UUID' })
  @ApiQuery({ 
    name: 'country', 
    required: false, 
    description: 'Filter by country code (ISO 3166-1 alpha-3)',
    example: 'USA'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament registrations retrieved successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tournament not found'
  })
  async getTournamentRegistrations(
    @Param('id') tournamentId: string,
    @Query('country') country?: string
  ) {
    this.logger.log(`Getting registrations for tournament: ${tournamentId}${country ? `, country: ${country}` : ''}`);
    
    if (country) {
      return this.batchRegistrationService.getExistingRegistrations(country, tournamentId);
    } else {
      return this.batchRegistrationService.getTournamentStats(tournamentId);
    }
  }

  @Get(':id/registrations/summary')
  @ApiOperation({ 
    summary: 'Get tournament registration summary',
    description: 'Retrieve registration summary for a specific tournament and country'
  })
  @ApiParam({ name: 'id', description: 'Tournament UUID' })
  @ApiQuery({ 
    name: 'country', 
    required: true, 
    description: 'Country code (ISO 3166-1 alpha-3)',
    example: 'USA'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tournament registration summary retrieved successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tournament not found'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Country parameter is required'
  })
  async getTournamentRegistrationSummary(
    @Param('id') tournamentId: string,
    @Query('country') country: string
  ) {
    if (!country) {
      throw new Error('Country parameter is required');
    }
    
    this.logger.log(`Getting registration summary for tournament: ${tournamentId}, country: ${country}`);
    return this.batchRegistrationService.getRegistrationSummary(country, tournamentId);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete tournament',
    description: 'Remove a tournament from the system'
  })
  @ApiParam({ name: 'id', description: 'Tournament UUID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Tournament deleted successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Tournament not found'
  })
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
} 