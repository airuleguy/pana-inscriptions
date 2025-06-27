import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TournamentService } from '../services/tournament.service';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { TournamentType } from '../entities/tournament.entity';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.create(createTournamentDto);
  }

  @Get()
  findAll(@Query('active') activeOnly?: string) {
    if (activeOnly === 'true') {
      return this.tournamentService.findActive();
    }
    return this.tournamentService.findAll();
  }

  @Get('by-type/:type')
  findByType(@Param('type') type: TournamentType) {
    return this.tournamentService.findByType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Get(':id/stats')
  getTournamentStats(@Param('id') id: string) {
    return this.tournamentService.getTournamentStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTournamentDto: UpdateTournamentDto) {
    return this.tournamentService.update(id, updateTournamentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
} 