import { ChoreographyCategory, ChoreographyType, calculateCategory } from '../constants/categories';
import { BusinessRulesFactory } from './business-rules/business-rules-factory';
import { TournamentType } from '../entities/tournament.entity';

// Re-export the centralized category calculation function
export { calculateCategory };

/**
 * Get business rules for a specific tournament type
 */
export function getBusinessRulesForTournament(tournamentType: TournamentType) {
  const factory = new BusinessRulesFactory();
  return factory.getStrategy(tournamentType);
}

/**
 * Determine choreography type based on gymnast count and gender composition
 */
export function determineChoreographyType(
  gymnastCount: number, 
  gymnasts: Array<{ gender: string }>
): ChoreographyType {
  switch (gymnastCount) {
    case 1:
      // For individual, check gender
      const gymnast = gymnasts[0];
      if (gymnast.gender.toUpperCase() === 'MALE' || gymnast.gender.toUpperCase() === 'M') {
        return ChoreographyType.MIND;
      } else {
        return ChoreographyType.WIND;
      }
    case 2:
      return ChoreographyType.MXP;
    case 3:
      return ChoreographyType.TRIO;
    case 5:
      return ChoreographyType.GRP;
    case 8:
      return ChoreographyType.DNCE;
    default:
      throw new Error(`Invalid gymnast count: ${gymnastCount}. Must be 1, 2, 3, 5, or 8.`);
  }
}

/**
 * Generate choreography name from gymnast surnames
 */
export function generateChoreographyName(surnames: string[]): string {
  return surnames
    .map(surname => surname.toUpperCase().trim())
    .join('-');
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validate if a gymnast count is allowed for a choreography type
 */
export function isValidGymnastCount(count: number): boolean {
  return [1, 2, 3, 5, 8].includes(count);
}

/**
 * Get choreography type display name
 */
export function getChoreographyTypeDisplayName(type: ChoreographyType): string {
  switch (type) {
    case ChoreographyType.MIND:
      return "Men's Individual";
    case ChoreographyType.WIND:
      return "Women's Individual";
    case ChoreographyType.MXP:
      return "Mixed Pair";
    case ChoreographyType.TRIO:
      return "Trio";
    case ChoreographyType.GRP:
      return "Group";
    case ChoreographyType.DNCE:
      return "Dance";
    default:
      return type;
  }
}

/**
 * Get expected gymnast count for a choreography type
 */
export function getExpectedGymnastCount(type: ChoreographyType): number {
  switch (type) {
    case ChoreographyType.MIND:
    case ChoreographyType.WIND:
      return 1;
    case ChoreographyType.MXP:
      return 2;
    case ChoreographyType.TRIO:
      return 3;
    case ChoreographyType.GRP:
      return 5;
    case ChoreographyType.DNCE:
      return 8;
    default:
      throw new Error(`Unknown choreography type: ${type}`);
  }
} 