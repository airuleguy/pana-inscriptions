import { ApiProperty } from '@nestjs/swagger';

export class GymnastDto {
  @ApiProperty({ description: 'FIG ID of the gymnast', example: 'FIG123456' })
  figId: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  lastName: string;

  @ApiProperty({ description: 'Gender', example: 'M' })
  gender: string;

  @ApiProperty({ description: 'Country code', example: 'USA' })
  country: string;

  @ApiProperty({ description: 'Birth date', example: '2000-01-15' })
  birthDate: string;

  @ApiProperty({ description: 'Discipline', example: 'AER' })
  discipline: string;

  @ApiProperty({ description: 'License status', example: true })
  isLicensed: boolean;
} 