import { BadRequestException } from '@nestjs/common';
import { BusinessRulesStrategy, CreateChoreographyRequest } from './base-business-rules.interface';
import { TournamentType } from '../../entities/tournament.entity';

export class CampeonatoPanamericanoStrategy implements BusinessRulesStrategy {
  getTournamentType(): TournamentType {
    return TournamentType.CAMPEONATO_PANAMERICANO;
  }

  async validateChoreographyCreation(
    request: CreateChoreographyRequest, 
    existingChoreographiesCount: number
  ): Promise<void> {
    // Campeonato Panamericano allows maximum 4 choreographies per country per category per choreography type
    const maxAllowed = this.getMaxChoreographiesPerCountryPerCategory();
    if (existingChoreographiesCount >= maxAllowed) {
      throw new BadRequestException(
        `Campeonato Panamericano allows maximum ${maxAllowed} choreographies per country per category per choreography type. ${request.country} already has ${existingChoreographiesCount} in ${request.category} ${request.type}.`
      );
    }

    await this.validateTournamentSpecificRules(request);
  }

  getMaxChoreographiesPerCountryPerCategory(): number {
    return 4;
  }

  getAdditionalValidationRules(): string[] {
    return [
      'Maximum 4 choreographies per country per category per choreography type',
      'All gymnasts must be from the same country',
      'Stricter age verification requirements',
      'Enhanced licensing validation'
    ];
  }

  async validateTournamentSpecificRules(request: CreateChoreographyRequest): Promise<void> {
    // Campeonato Panamericano specific rules
    
    // Rule 1: Enhanced validation for licensing (could be expanded to check specific requirements)
    if (request.gymnastFigIds.length === 0) {
      throw new BadRequestException('At least one gymnast is required for Campeonato Panamericano');
    }

    // Rule 2: Country consistency validation (this would be validated with actual gymnast data)
    // This is a placeholder for more complex validation that would happen with actual gymnast data
    
    // Rule 3: Additional tournament-specific validations can be added here
    // For example, checking if country is eligible for Campeonato Panamericano
    const eligibleCountries = this.getEligibleCountries();
    if (!eligibleCountries.includes(request.country.toUpperCase())) {
      throw new BadRequestException(
        `Country ${request.country} is not eligible for Campeonato Panamericano. Eligible countries: ${eligibleCountries.join(', ')}`
      );
    }
  }

  private getEligibleCountries(): string[] {
    // Pan-American countries - this could be loaded from a configuration or database
    return [
      'ARG', 'BOL', 'BRA', 'CAN', 'CHI', 'COL', 'CRC', 'CUB', 'DOM', 'ECU',
      'ESA', 'GUA', 'HAI', 'HON', 'JAM', 'MEX', 'NCA', 'PAN', 'PAR', 'PER',
      'PUR', 'TTO', 'URU', 'USA', 'VEN'
    ];
  }
} 