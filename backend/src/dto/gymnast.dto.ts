import { ApiProperty } from '@nestjs/swagger';

export class GymnastDto {
  @ApiProperty({ description: 'Internal UUID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: 'FIG ID of the gymnast', example: 'FIG123456' })
  figId: string;

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

  @ApiProperty({ description: 'Date of birth', example: '2000-01-15T00:00:00Z' })
  dateOfBirth: Date;

  @ApiProperty({ description: 'Discipline', example: 'AER' })
  discipline: string;

  @ApiProperty({ description: 'License validity status', example: true })
  licenseValid: boolean;

  @ApiProperty({ description: 'License expiry date', example: '2027-05-22T00:00:00Z', nullable: true })
  licenseExpiryDate?: Date;

  @ApiProperty({ description: 'Current age', example: 24 })
  age: number;

  @ApiProperty({ description: 'Age category', example: 'SENIOR', enum: ['YOUTH', 'JUNIOR', 'SENIOR'] })
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';

  @ApiProperty({ description: 'Whether this gymnast was created locally', example: false })
  isLocal?: boolean;
} 