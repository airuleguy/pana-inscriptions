import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { SupportRole } from '../constants/support-roles';

export class CreateSupportRegistrationDto {
  @ApiProperty({ description: 'Support personnel first name', example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Support personnel last name', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Support personnel full name', example: 'Jane Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ 
    description: 'Role within delegation', 
    enum: SupportRole, 
    example: SupportRole.DELEGATION_LEADER 
  })
  @IsEnum(SupportRole, { message: 'Role must be one of: DELEGATION_LEADER, MEDIC, COMPANION' })
  role: SupportRole;

  @ApiProperty({ description: 'Gender', example: 'FEMALE', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'URU', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Club name (optional for country-level tournaments)', example: 'Elite Gymnastics Club', required: false })
  @IsOptional()
  @IsString()
  club?: string;

  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Tournament ID' })
  @IsUUID()
  tournamentId: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}


