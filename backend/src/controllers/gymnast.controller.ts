import { Controller, Get, Query, Param, HttpStatus, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FigApiService } from '../services/fig-api.service';
import { GymnastDto } from '../dto/gymnast.dto';

@ApiTags('gymnasts')
@Controller('api/v1/gymnasts')
export class GymnastController {
  constructor(private readonly figApiService: FigApiService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all licensed gymnasts',
    description: 'Retrieve all aerobic gymnasts from FIG database with optional country filter'
  })
  @ApiQuery({ 
    name: 'country', 
    required: false, 
    description: 'Filter by country code (ISO 3166-1 alpha-3)',
    example: 'USA'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of licensed gymnasts',
    type: [GymnastDto]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_GATEWAY, 
    description: 'FIG API unavailable'
  })
  async findAll(@Query('country') country?: string): Promise<GymnastDto[]> {
    if (country) {
      return this.figApiService.getGymnastsByCountry(country);
    }
    return this.figApiService.getGymnasts();
  }

  @Get(':figId')
  @ApiOperation({ 
    summary: 'Get gymnast by FIG ID',
    description: 'Retrieve a specific gymnast by their FIG ID'
  })
  @ApiParam({ name: 'figId', description: 'FIG ID of the gymnast', example: 'FIG123456' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Gymnast details',
    type: GymnastDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Gymnast not found'
  })
  async findOne(@Param('figId') figId: string): Promise<GymnastDto | null> {
    return this.figApiService.getGymnastByFigId(figId);
  }

  @Delete('cache')
  @ApiOperation({ 
    summary: 'Clear gymnast cache',
    description: 'Clear the cached FIG gymnast data to force fresh API call'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Cache cleared successfully'
  })
  async clearCache(): Promise<void> {
    return this.figApiService.clearCache();
  }
} 