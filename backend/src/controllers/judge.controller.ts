import { Controller, Get, Query, Param, HttpStatus, Delete, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FigApiService } from '../services/fig-api.service';
import { JudgeDto } from '../dto/judge.dto';

@ApiTags('judges')
@Controller('judges')
export class JudgeController {
  private readonly logger = new Logger(JudgeController.name);

  constructor(
    private readonly figApiService: FigApiService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all certified judges',
    description: 'Retrieve all aerobic gymnastics judges from FIG database with optional country filter'
  })
  @ApiQuery({ 
    name: 'country', 
    required: false, 
    description: 'Filter by country code (ISO 3166-1 alpha-3)',
    example: 'USA'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of certified judges',
    type: [JudgeDto]
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_GATEWAY, 
    description: 'FIG API unavailable'
  })
  async findAll(@Query('country') country?: string): Promise<JudgeDto[]> {
    if (country) {
      return this.figApiService.getJudgesByCountry(country);
    }
    return this.figApiService.getJudges();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get judge by FIG ID',
    description: 'Retrieve a specific judge by their FIG ID'
  })
  @ApiParam({ name: 'id', description: 'FIG ID of the judge', example: '3622' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Judge details',
    type: JudgeDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Judge not found'
  })
  async findOne(@Param('id') id: string): Promise<JudgeDto | null> {
    return this.figApiService.getJudgeById(id);
  }

  @Delete('cache')
  @ApiOperation({ 
    summary: 'Clear judge cache',
    description: 'Clear the cached FIG judge data to force fresh API call'
  })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Cache cleared successfully'
  })
  async clearCache(): Promise<void> {
    return this.figApiService.clearJudgeCache();
  }


} 