import { ChoreographyCategory, ChoreographyType } from '../entities/choreography.entity';

/**
 * Calculate the category based on the oldest gymnast's age
 */
export function calculateCategory(oldestAge: number): ChoreographyCategory {
  if (oldestAge <= 15) {
    return ChoreographyCategory.YOUTH;
  } else if (oldestAge <= 17) {
    return ChoreographyCategory.JUNIOR;
  } else {
    return ChoreographyCategory.SENIOR;
  }
}

/**
 * Determine choreography type based on number of gymnasts
 */
export function determineChoreographyType(gymnastCount: number): ChoreographyType {
  switch (gymnastCount) {
    case 1:
      return ChoreographyType.INDIVIDUAL;
    case 2:
      return ChoreographyType.MIXED_PAIR;
    case 3:
      return ChoreographyType.TRIO;
    case 5:
      return ChoreographyType.GROUP;
    case 8:
      return ChoreographyType.PLATFORM;
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