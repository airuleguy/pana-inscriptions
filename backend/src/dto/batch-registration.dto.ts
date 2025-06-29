import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChoreographyDto } from './create-choreography.dto';
import { CreateCoachRegistrationDto } from './create-coach-registration.dto';
import { CreateJudgeRegistrationDto } from './create-judge-registration.dto';

export class BatchRegistrationDto {
  @ApiProperty({ 
    description: 'List of choreographies to register',
    type: [CreateChoreographyDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoreographyDto)
  choreographies?: CreateChoreographyDto[];

  @ApiProperty({ 
    description: 'List of coaches to register',
    type: [CreateCoachRegistrationDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCoachRegistrationDto)
  coaches?: CreateCoachRegistrationDto[];

  @ApiProperty({ 
    description: 'List of judges to register',
    type: [CreateJudgeRegistrationDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJudgeRegistrationDto)
  judges?: CreateJudgeRegistrationDto[];

  @ApiProperty({ description: 'Tournament information' })
  @IsObject()
  tournament: {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    location?: string;
  };

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-3)', example: 'USA' })
  @IsString()
  country: string;
}

export class BatchRegistrationResponseDto {
  @ApiProperty({ description: 'Whether the batch registration was successful' })
  success: boolean;

  @ApiProperty({ description: 'Registration results' })
  results: {
    choreographies: any[];
    coaches: any[];
    judges: any[];
  };

  @ApiProperty({ description: 'List of errors if any occurred', required: false })
  errors?: string[];
} 