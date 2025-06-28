import { ApiProperty } from '@nestjs/swagger';

export class CoachDto {
  @ApiProperty({ description: 'FIG ID of the coach', example: 'COACH123456' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  lastName: string;

  @ApiProperty({ description: 'Gender', example: 'Male' })
  gender: string;

  @ApiProperty({ description: 'Country code', example: 'USA' })
  country: string;

  @ApiProperty({ description: 'Discipline', example: 'AER' })
  discipline: string;

  @ApiProperty({ description: 'Coach level', example: 'L1, L2' })
  level: string;
} 