import { IsString, IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { TournamentType } from '../entities/tournament.entity';

export class CreateTournamentDto {
  @IsString()
  name: string;

  @IsString()
  shortName: string;

  @IsEnum(TournamentType)
  type: TournamentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 