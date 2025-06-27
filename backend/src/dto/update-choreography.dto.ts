import { PartialType } from '@nestjs/swagger';
import { CreateChoreographyDto } from './create-choreography.dto';

export class UpdateChoreographyDto extends PartialType(CreateChoreographyDto) {} 