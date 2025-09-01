import { BadRequestException } from '@nestjs/common';
import { BusinessRulesStrategy, CreateChoreographyRequest } from './base-business-rules.interface';
import { TournamentType } from '../../entities/tournament.entity';

export class CopaPanamericanaStrategy implements BusinessRulesStrategy {
  getTournamentType(): TournamentType {
    return TournamentType.COPA_PANAMERICANA;
  }

  async validateChoreographyCreation(
    request: CreateChoreographyRequest, 
    existingChoreographiesCount: number
  ): Promise<void> {
    // Copa Panamericana allows maximum 4 choreographies per country per category per choreography type
    const maxAllowed = this.getMaxChoreographiesPerCountryPerCategory();
    if (existingChoreographiesCount >= maxAllowed) {
      throw new BadRequestException(
        `Copa Panamericana allows maximum ${maxAllowed} choreographies per country per category per choreography type. ${request.country} already has ${existingChoreographiesCount} in ${request.category} ${request.type}.`
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
      'More flexible country eligibility',
      'Standard licensing requirements',
      'Open to development countries'
    ];
  }

  async validateTournamentSpecificRules(request: CreateChoreographyRequest): Promise<void> {
    // Copa Panamericana specific rules (more relaxed than Campeonato)
    
    // Rule 1: Basic validation
    if (request.gymnastFigIds.length === 0) {
      throw new BadRequestException('At least one gymnast is required for Copa Panamericana');
    }

    // Rule 2: More flexible country eligibility
    // Copa Panamericana is more open to development countries and guest countries
    const eligibleCountries = this.getEligibleCountries();
    if (!eligibleCountries.includes(request.country.toUpperCase())) {
      throw new BadRequestException(
        `Country ${request.country} is not eligible for Copa Panamericana. Eligible countries: ${eligibleCountries.join(', ')}`
      );
    }

    // Rule 3: Additional Copa-specific validations can be added here
    // For example, checking development country benefits or guest country rules
  }

  private getEligibleCountries(): string[] {
    // Copa Panamericana includes Pan-American countries plus guest countries
    return [
      // Pan-American countries
      'ARG', 'BOL', 'BRA', 'CAN', 'CHI', 'COL', 'CRC', 'CUB', 'DOM', 'ECU',
      'ESA', 'GUA', 'HAI', 'HON', 'JAM', 'MEX', 'NCA', 'PAN', 'PAR', 'PER',
      'PUR', 'TTO', 'URU', 'USA', 'VEN',
      // Additional guest countries for Copa
      'ESP', 'POR', 'ITA', 'FRA', 'GER', 'GBR', 'JPN', 'KOR', 'CHN', 'AUS'
    ];
  }
} 