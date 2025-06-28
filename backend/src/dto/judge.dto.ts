import { ApiProperty } from '@nestjs/swagger';

export class JudgeDto {
  @ApiProperty({ description: 'FIG ID of the judge', example: '3622' })
  id: string;

  @ApiProperty({ description: 'First name', example: 'Reham Abdelraouf Ahmed' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'ABDELAAL' })
  lastName: string;

  @ApiProperty({ description: 'Date of birth', example: '1974-07-29' })
  birth: string;

  @ApiProperty({ description: 'Gender', example: 'Female' })
  gender: string;

  @ApiProperty({ description: 'Country code', example: 'EGY' })
  country: string;

  @ApiProperty({ description: 'Discipline', example: 'AER' })
  discipline: string;

  @ApiProperty({ description: 'Judge category', example: '3' })
  category: string;
} 