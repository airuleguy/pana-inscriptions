import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TournamentService } from '../services/tournament.service';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { Tournament, TournamentType } from '../entities/tournament.entity';

@ApiTags('tournaments')
@Controller('api/v1/tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

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