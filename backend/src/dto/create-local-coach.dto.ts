import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class CreateLocalCoachDto {
  @ApiProperty({ description: 'FIG ID of the coach', example: 'COACH123456' })
  @IsString()
  figId: string;

  @ApiProperty({ description: 'Coach first name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Coach last name', example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Coach full name', example: 'John Smith' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Gender', example: 'MALE', enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Club name (optional for country-level tournaments)', example: 'Elite Gymnastics Club', required: false })
  @IsOptional()
  @IsString()
  club?: string;

  @ApiProperty({ description: 'Coach level', example: 'L1' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Level description', example: 'Level 1' })
  @IsString()
  levelDescription: string;
}
