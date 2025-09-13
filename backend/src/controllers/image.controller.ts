import { Controller, Get, Param, Query, HttpStatus, Delete, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { ImageService } from '../services/image.service';

@ApiTags('images')
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('gymnast/:id')
  @ApiOperation({
    summary: 'Get gymnast image',
    description: 'Retrieve a gymnast image from either FIG API or S3/local storage based on gymnast type'
  })
  @ApiParam({ name: 'id', description: 'Gymnast ID or FIG ID' })
  @ApiQuery({ name: 'width', required: false, type: Number })
  @ApiQuery({ name: 'height', required: false, type: Number })
  @ApiQuery({ name: 'quality', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image retrieved successfully'
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found'
  })
  async getGymnastImage(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('width') width?: number,
    @Query('height') height?: number,
    @Query('quality') quality?: number,
  ): Promise<void> {
    const image = await this.imageService.getGymnastImage(id, width, height, quality);

    res.set({
      'Content-Type': image.contentType,
      'Content-Length': image.contentLength,
      'Last-Modified': image.lastModified,
      'Cache-Control': 'public, max-age=86400', // 24 hours
      'ETag': image.etag || `"${id}-${image.lastModified}"`,
    });

    res.send(image.data);
  }

  @Delete('cache/gymnast/:id')
  @ApiOperation({
    summary: 'Clear gymnast image cache',
    description: 'Clear the cache for a specific gymnast image or all gymnast images'
  })
  @ApiParam({ name: 'id', description: 'Gymnast ID or FIG ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cache cleared successfully'
  })
  async clearCache(
    @Param('id') id: string
  ): Promise<void> {
    await this.imageService.clearImageCache(id);
  }

  @Get('cache/stats')
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Get statistics about the image cache'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cache statistics retrieved successfully'
  })
  async getCacheStats() {
    return this.imageService.getCacheStats();
  }
}
