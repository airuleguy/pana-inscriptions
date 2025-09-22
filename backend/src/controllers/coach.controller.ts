import { Controller, Post, Body, Get, Query, UseGuards, BadRequestException, Delete, Param, UseInterceptors, UploadedFile, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiParam, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Delete('cache/:country')
  @ApiOperation({ summary: 'Clear coach cache for specific country' })
  @ApiParam({ name: 'country', description: 'Country code (e.g., URU, ARG)', example: 'URU' })
  @ApiResponse({ status: 204, description: 'Country-specific cache cleared successfully' })
  async clearCacheForCountry(@Param('country') country: string): Promise<void> {
    return await this.coachService.clearCacheForCountry(country);
  }

  @Post(':id/image')
  @ApiOperation({ 
    summary: 'Upload coach image',
    description: 'Upload an image for a local coach (FIG API coaches cannot have images uploaded)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Database ID of the coach', example: 'uuid-string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, or GIF)',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Image successfully uploaded',
    type: Coach
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Coach not found'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid image format or cannot upload for FIG API coaches'
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only JPEG, PNG, and GIF files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Coach> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.coachService.uploadImage(id, file.buffer);
  }
}