import { Controller, Get, Query, Param, HttpStatus, Delete, Post, Body, Patch, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { GymnastService } from '../services/gymnast.service';
import { GymnastDto } from '../dto/gymnast.dto';
import { CreateGymnastDto } from '../dto/create-gymnast.dto';
import { UpdateGymnastDto } from '../dto/update-gymnast.dto';

@ApiTags('gymnasts')
@Controller('gymnasts')
export class GymnastController {
  constructor(private readonly gymnastService: GymnastService) {}

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
    return this.gymnastService.findAll(country);
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
    return this.gymnastService.findByFigId(figId);
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
    return this.gymnastService.clearCache();
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new local gymnast',
    description: 'Create a new gymnast locally for athletes not registered in FIG database'
  })
  @ApiBody({ type: CreateGymnastDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Gymnast successfully created',
    type: GymnastDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data or FIG ID already exists'
  })
  async create(@Body(ValidationPipe) createGymnastDto: CreateGymnastDto): Promise<GymnastDto> {
    return this.gymnastService.create(createGymnastDto);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a local gymnast',
    description: 'Update an existing local gymnast (FIG API gymnasts cannot be updated)'
  })
  @ApiParam({ name: 'id', description: 'Database ID of the gymnast', example: 'uuid-string' })
  @ApiBody({ type: UpdateGymnastDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Gymnast successfully updated',
    type: GymnastDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Gymnast not found'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot update FIG API gymnasts'
  })
  async update(@Param('id') id: string, @Body(ValidationPipe) updateGymnastDto: UpdateGymnastDto): Promise<GymnastDto> {
    return this.gymnastService.update(id, updateGymnastDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a local gymnast',
    description: 'Delete a local gymnast (FIG API gymnasts cannot be deleted)'
  })
  @ApiParam({ name: 'id', description: 'Database ID of the gymnast', example: 'uuid-string' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Gymnast successfully deleted'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Gymnast not found'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot delete FIG API gymnasts'
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.gymnastService.remove(id);
  }
} 