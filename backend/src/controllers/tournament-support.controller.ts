import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Logger, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CountryAuthGuard, CountryScoped } from '../guards/country-auth.guard';
import { SupportRegistrationService } from '../services/support-registration.service';
import { CreateSupportRegistrationDto } from '../dto/create-support-registration.dto';
import { SupportStaff } from '../entities/support.entity';

@ApiTags('tournament-support')
@ApiBearerAuth()
@UseGuards(CountryAuthGuard)
@Controller('tournaments/:tournamentId/support')
export class TournamentSupportController {
  private readonly logger = new Logger(TournamentSupportController.name);

  constructor(private readonly supportService: SupportRegistrationService) {}

  @Post()
  @CountryScoped()
  @ApiOperation({ summary: 'Register support personnel for tournament' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Support registered successfully', type: SupportStaff })
  async registerSupport(
    @Param('tournamentId') tournamentId: string,
    @Body() data: CreateSupportRegistrationDto | CreateSupportRegistrationDto[],
    @Req() request: Request,
  ): Promise<{ success: boolean; results: SupportStaff[]; errors?: string[] }> {
    const items = Array.isArray(data) ? data : [data];
    const userCountry = (request as any).userCountry;

    items.forEach(item => {
      item.tournamentId = tournamentId;
      item.country = userCountry;
      if (!item.fullName) item.fullName = `${item.firstName} ${item.lastName}`.trim();
      // Force role from locale: controller is neutral, default to SUPPORT if not provided
      if (!item.role) item.role = 'SUPPORT';
    });

    const results: SupportStaff[] = [];
    const errors: string[] = [];
    for (const dto of items) {
      try {
        const created = await this.supportService.create(dto);
        results.push(created);
      } catch (error: any) {
        const message = `Failed to register support "${dto.fullName}": ${error.message}`;
        this.logger.error(message);
        errors.push(message);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors: errors.length ? errors : undefined,
    };
  }

  @Get()
  @CountryScoped()
  @ApiOperation({ summary: 'Get tournament support registrations' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiQuery({ name: 'role', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Support registrations retrieved', type: [SupportStaff] })
  async getTournamentSupport(
    @Param('tournamentId') tournamentId: string,
    @Req() request: Request,
    @Query('role') role?: string,
  ): Promise<SupportStaff[]> {
    const country = (request as any).userCountry;
    const list = await this.supportService.findAll(country, tournamentId);
    return role ? list.filter(s => s.role === role) : list;
  }

  @Put(':supportId')
  @CountryScoped()
  @ApiOperation({ summary: 'Update support registration' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'supportId', description: 'Support registration UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Support updated', type: SupportStaff })
  async updateSupport(
    @Param('tournamentId') tournamentId: string,
    @Param('supportId') supportId: string,
    @Body() updateData: Partial<CreateSupportRegistrationDto>,
  ): Promise<SupportStaff> {
    delete updateData.tournamentId;
    return this.supportService.update(supportId, updateData);
  }

  @Delete(':supportId')
  @CountryScoped()
  @ApiOperation({ summary: 'Remove support registration' })
  @ApiParam({ name: 'tournamentId', description: 'Tournament UUID' })
  @ApiParam({ name: 'supportId', description: 'Support registration UUID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Support registration removed' })
  async removeSupport(
    @Param('tournamentId') tournamentId: string,
    @Param('supportId') supportId: string,
  ): Promise<void> {
    return this.supportService.remove(supportId);
  }
}


