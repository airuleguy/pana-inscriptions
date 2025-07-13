import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsOptional, MinLength, MaxLength, IsNumber, IsBoolean } from 'class-validator';

export class UpdateGymnastDto {
  @ApiProperty({ description: 'First name', example: 'John', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Smith', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ description: 'Gender', example: 'MALE', enum: ['MALE', 'FEMALE'], required: false })
  @IsEnum(['MALE', 'FEMALE'])
  @IsOptional()
  gender?: 'MALE' | 'FEMALE';

  @ApiProperty({ description: 'Country code', example: 'USA', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(3)
  country?: string;

  @ApiProperty({ description: 'Date of birth', example: '2000-01-15', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  // These are calculated automatically but can be included for completeness
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsEnum(['YOUTH', 'JUNIOR', 'SENIOR'])
  category?: 'YOUTH' | 'JUNIOR' | 'SENIOR';
} 