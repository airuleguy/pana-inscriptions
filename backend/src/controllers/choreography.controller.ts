import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ChoreographyService } from '../services/choreography.service';
import { CreateChoreographyDto } from '../dto/create-choreography.dto';
import { UpdateChoreographyDto } from '../dto/update-choreography.dto';
import { Choreography } from '../entities/choreography.entity';
import { CountryAuthGuard, CountryScoped } from '../guards/country-auth.guard';

@ApiTags('choreographies')
@ApiBearerAuth()
@UseGuards(CountryAuthGuard)
@Controller('choreographies')
export class ChoreographyController {
  constructor(private readonly choreographyService: ChoreographyService) {}

  @Post()
  @CountryScoped()
  @ApiOperation({ 
    summary: 'Create a new choreography',
    description: 'Register a new choreography from your country for the tournament with validation of business rules'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Choreography created successfully',
    type: Choreography
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input or business rule violation'
  })
  async create(
    @Body(ValidationPipe) createChoreographyDto: CreateChoreographyDto,
    @Req() request: Request
  ): Promise<Choreography> {
    // Country will be automatically injected by the guard
    return this.choreographyService.create(createChoreographyDto);
  }

  @Get()
  @CountryScoped()
  @ApiOperation({ 
    summary: 'Get all choreographies from your country',
    description: 'Retrieve all registered choreographies from your country'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of choreographies',
    type: [Choreography]
  })
  async findAll(@Req() request: Request): Promise<Choreography[]> {
    const country = (request as any).userCountry;
    return this.choreographyService.findByCountry(country);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get choreography by ID',
    description: 'Retrieve a specific choreography with all gymnast details'
  })
  @ApiParam({ name: 'id', description: 'Choreography UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Choreography details',
    type: Choreography
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Choreography not found'
  })
  async findOne(@Param('id') id: string): Promise<Choreography> {
    return this.choreographyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update choreography',
    description: 'Update an existing choreography with validation'
  })
  @ApiParam({ name: 'id', description: 'Choreography UUID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Choreography updated successfully',
    type: Choreography
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Choreography not found'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input or business rule violation'
  })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateChoreographyDto: UpdateChoreographyDto
  ): Promise<Choreography> {
    return this.choreographyService.update(id, updateChoreographyDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete choreography',
    description: 'Remove a choreography from the tournament'
  })
  @ApiParam({ name: 'id', description: 'Choreography UUID' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Choreography deleted successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Choreography not found'
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.choreographyService.remove(id);
  }

  @Get('stats/:country')
  @ApiOperation({ 
    summary: 'Get country statistics',
    description: 'Retrieve registration statistics for a specific country'
  })
  @ApiParam({ 
    name: 'country', 
    description: 'Country code (ISO 3166-1 alpha-3)',
    example: 'USA'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Country registration statistics'
  })
  async getCountryStats(@Param('country') country: string) {
    return this.choreographyService.getCountryStats(country);
  }
} 