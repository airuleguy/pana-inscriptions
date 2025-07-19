import { ApiProperty } from '@nestjs/swagger';

export class CoachDto {
  @ApiProperty({ description: 'FIG ID of the coach', example: 'COACH123456' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  lastName: string;

  @ApiProperty({ description: 'Full name', example: 'John Smith' })
  fullName: string;

  @ApiProperty({ description: 'Gender', example: 'MALE', enum: ['MALE', 'FEMALE'] })
  gender: 'MALE' | 'FEMALE';

  @ApiProperty({ description: 'Country code', example: 'USA' })
  country: string;

  @ApiProperty({ description: 'Discipline', example: 'AER' })
  discipline: string;

  @ApiProperty({ description: 'Coach level', example: 'L1, L2' })
  level: string;

  @ApiProperty({ description: 'Level description', example: 'Level 1 Coach, Level 2 Coach' })
  levelDescription: string;

  @ApiProperty({ description: 'FIG image URL', nullable: true, example: 'https://www.gymnastics.sport/asset.php?id=bpic_COACH123456' })
  imageUrl?: string;
} 