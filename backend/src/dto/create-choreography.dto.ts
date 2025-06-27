import { IsString, IsEnum, IsArray, IsOptional, IsInt, Min, Max, ArrayMinSize, ArrayMaxSize, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';

export class CreateChoreographyDto {
  @ApiProperty({ 
    description: 'Name of the choreography (auto-generated from gymnast surnames)', 
    example: 'SMITH-JONES-BROWN' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Country code (ISO 3166-1 alpha-3)', 
    example: 'USA' 
  })
  @IsString()
  country: string;

  @ApiProperty({ 
    description: 'Category based on oldest gymnast age',
    enum: ChoreographyCategory,
    example: ChoreographyCategory.SENIOR
  })
  @IsEnum(ChoreographyCategory)
  category: ChoreographyCategory;

  @ApiProperty({ 
    description: 'Type of choreography based on number of gymnasts',
    enum: ChoreographyType,
    example: ChoreographyType.TRIO
  })
  @IsEnum(ChoreographyType)
  type: ChoreographyType;

  @ApiProperty({ 
    description: 'Number of gymnasts in the choreography',
    minimum: 1,
    maximum: 8,
    example: 3
  })
  @IsInt()
  @Min(1)
  @Max(8)
  gymnastCount: number;

  @ApiProperty({ 
    description: 'Age of the oldest gymnast',
    minimum: 10,
    maximum: 50,
    example: 22
  })
  @IsInt()
  @Min(10)
  @Max(50)
  oldestGymnastAge: number;

  @ApiProperty({ 
    description: 'Array of FIG IDs for the gymnasts',
    type: [String],
    example: ['FIG123456', 'FIG789012', 'FIG345678']
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  gymnastFigIds: string[];

  @ApiProperty({ 
    description: 'Optional notes or comments',
    required: false,
    example: 'Special requirements or comments'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'Tournament ID for the choreography',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  tournamentId: string;
} 