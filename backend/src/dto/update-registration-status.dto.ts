import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { RegistrationStatus } from '../constants/registration-status';

export class UpdateRegistrationStatusDto {
  @ApiProperty({ 
    description: 'New registration status',
    enum: RegistrationStatus,
    example: 'SUBMITTED'
  })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @ApiProperty({ 
    description: 'Optional notes for status change',
    example: 'Approved by tournament director',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchStatusUpdateDto {
  @ApiProperty({ 
    description: 'Registration IDs to update',
    type: [String],
    example: ['uuid1', 'uuid2', 'uuid3']
  })
  @IsString({ each: true })
  registrationIds: string[];

  @ApiProperty({ 
    description: 'New registration status',
    enum: RegistrationStatus,
    example: 'SUBMITTED'
  })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @ApiProperty({ 
    description: 'Optional notes for status change',
    example: 'Batch submission completed',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 