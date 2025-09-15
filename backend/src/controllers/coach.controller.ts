import { Controller, Post, Body, Get, Query, UseGuards, BadRequestException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CoachService } from '../services/coach.service';
import { Coach } from '../entities/coach.entity';
import { CreateLocalCoachDto } from '../dto/create-local-coach.dto';
import { CountryAuthGuard } from '../guards/country-auth.guard';

@ApiTags('coaches')
@Controller('coaches')
@UseGuards(CountryAuthGuard)
@ApiBearerAuth()
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new local coach' })
  @ApiResponse({ status: 201, description: 'Coach created successfully', type: Coach })
  @ApiResponse({ status: 400, description: 'Invalid input data or coach already exists' })
  async createLocal(@Body() createCoachDto: CreateLocalCoachDto): Promise<Coach> {
    try {
      return await this.coachService.createLocal(createCoachDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all coaches with optional country filter' })
  @ApiResponse({ status: 200, description: 'List of coaches', type: [Coach] })
  async findAll(@Query('country') country?: string): Promise<Coach[]> {
    return await this.coachService.findAll(country);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search coaches by name and country' })
  @ApiResponse({ status: 200, description: 'List of matching coaches', type: [Coach] })
  async search(
    @Query('query') query: string,
    @Query('country') country?: string,
  ): Promise<Coach[]> {
    return await this.coachService.search(query, country);
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Clear coach cache' })
  @ApiResponse({ status: 204, description: 'Cache cleared successfully' })
  async clearCache(): Promise<void> {
    return await this.coachService.clearCache();
  }
}