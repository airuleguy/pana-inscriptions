import { ApiProperty } from '@nestjs/swagger';

export class JudgeDto {
  @ApiProperty({ description: 'FIG ID of the judge', example: '3622' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'Reham Abdelraouf Ahmed' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'ABDELAAL' })
  lastName: string;

  @ApiProperty({ description: 'Full name', example: 'Reham Abdelraouf Ahmed ABDELAAL' })
  fullName: string;

  @ApiProperty({ description: 'Date of birth (ISO string)', example: '1974-07-29' })
  birth: string;

  @ApiProperty({ description: 'Date of birth as Date object', example: '1974-07-29T00:00:00Z' })
  dateOfBirth: Date;

  @ApiProperty({ description: 'Gender', example: 'FEMALE', enum: ['MALE', 'FEMALE'] })
  gender: 'MALE' | 'FEMALE';

  @ApiProperty({ description: 'Country code', example: 'EGY' })
  country: string;

  @ApiProperty({ description: 'Discipline', example: 'AER' })
  discipline: string;

  @ApiProperty({ description: 'Judge category', example: '3' })
  category: string;

  @ApiProperty({ description: 'Category description', example: 'Category 3 (National)' })
  categoryDescription: string;

  @ApiProperty({ description: 'Current age', example: 49 })
  age: number;

  @ApiProperty({ description: 'FIG image URL', nullable: true, example: 'https://www.gymnastics.sport/asset.php?id=bpic_3622' })
  imageUrl?: string;
} 