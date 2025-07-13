import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateGymnastDto {
  @ApiProperty({ description: 'FIG ID of the gymnast', example: 'FIG123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  figId: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'Gender', example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @ApiProperty({ description: 'Country code', example: 'USA' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(3)
  country: string;

  @ApiProperty({ description: 'Date of birth', example: '2000-01-15' })
  @IsDateString()
  dateOfBirth: string;
} 