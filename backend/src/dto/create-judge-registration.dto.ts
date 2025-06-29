import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateJudgeRegistrationDto {
  @ApiProperty({ description: 'FIG ID of the judge', example: '3622' })
  @IsString()
  figId: string;

  @ApiProperty({ description: 'Judge first name', example: 'Reham Abdelraouf Ahmed' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Judge last name', example: 'ABDELAAL' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Judge full name', example: 'Reham Abdelraouf Ahmed ABDELAAL' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Date of birth', example: '1974-07-29' })
  @IsString()
  birth: string;

  @ApiProperty({ description: 'Gender', example: 'FEMALE' })
  @IsString()
  gender: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'EGY' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Judge category', example: '3' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Category description', example: 'Category 3' })
  @IsString()
  categoryDescription: string;

  @ApiProperty({ description: 'Tournament ID' })
  @IsUUID()
  tournamentId: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
} 