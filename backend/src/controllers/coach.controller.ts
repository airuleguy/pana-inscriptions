import { Controller, Get, Query, Param, HttpStatus, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FigApiService } from '../services/fig-api.service';
import { CoachDto } from '../dto/coach.dto';

@ApiTags('coaches')
@Controller('api/v1/coaches')
export class CoachController {
  private readonly logger = new Logger(CoachController.name);

  constructor(
    private readonly figApiService: FigApiService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all certified coaches',
    description: 'Retrieve all aerobic gymnastics coaches from FIG database with optional country filter'
  })
  @ApiQuery({ 
    name: 'country', 
    required: false, 
    description: 'Filter by country code (ISO 3166-1 alpha-3)',
    example: 'USA'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of certified coaches',
    type: [CoachDto]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_GATEWAY, 
    description: 'FIG API unavailable'
  })
  async findAll(@Query('country') country?: string): Promise<CoachDto[]> {
    if (country) {
      return this.figApiService.getCoachesByCountry(country);
    }
    return this.figApiService.getCoaches();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get coach by FIG ID',
    description: 'Retrieve a specific coach by their FIG ID'
  })
  @ApiParam({ name: 'id', description: 'FIG ID of the coach', example: 'COACH123456' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Coach details',
    type: CoachDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Coach not found'
  })
  async findOne(@Param('id') id: string): Promise<CoachDto | null> {
    return this.figApiService.getCoachById(id);
  }

  @Delete('cache')
  @ApiOperation({ 
    summary: 'Clear coach cache',
    description: 'Clear the cached FIG coach data to force fresh API call'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Cache cleared successfully'
  })
  async clearCache(): Promise<void> {
    return this.figApiService.clearCoachCache();
  }


} 