export enum ChoreographyCategory {
  YOUTH = 'YOUTH',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR'
}

export enum ChoreographyType {
  MIND = 'MIND',     // Men's Individual (1)
  WIND = 'WIND',     // Women's Individual (1)
  MXP = 'MXP',       // Mixed Pair (2)
  TRIO = 'TRIO',     // Trio (3)
  GRP = 'GRP',       // Group (5)
  DNCE = 'DNCE'      // Dance (8)
}

// Age limits for categories (based on FIG rules)
export const AGE_LIMITS = {
  [ChoreographyCategory.YOUTH]: { min: 0, max: 14 },
  [ChoreographyCategory.JUNIOR]: { min: 15, max: 17 },
  [ChoreographyCategory.SENIOR]: { min: 18, max: 100 }
} as const;

// Choreography type information
export const CHOREOGRAPHY_TYPE_INFO = {
  [ChoreographyType.MIND]: { name: "Men's Individual", count: 1 },
  [ChoreographyType.WIND]: { name: "Women's Individual", count: 1 },
  [ChoreographyType.MXP]: { name: "Mixed Pair", count: 2 },
  [ChoreographyType.TRIO]: { name: "Trio", count: 3 },
  [ChoreographyType.GRP]: { name: "Group", count: 5 },
  [ChoreographyType.DNCE]: { name: "Dance", count: 8 }
} as const;

export const VALID_CATEGORIES = Object.values(ChoreographyCategory);
export const VALID_CHOREOGRAPHY_TYPES = Object.values(ChoreographyType);

/**
 * Calculate the category based on the oldest gymnast's age
 * This is the single source of truth for category calculation logic
 */
export function calculateCategory(oldestAge: number): ChoreographyCategory {
  if (oldestAge <= 14) {
    return ChoreographyCategory.YOUTH;
  } else if (oldestAge <= 17) {
    return ChoreographyCategory.JUNIOR;
  } else {
    return ChoreographyCategory.SENIOR;
  }
}

/**
 * Validate if an age falls within the specified category
 */
export function isAgeInCategory(age: number, category: ChoreographyCategory): boolean {
  const limits = AGE_LIMITS[category];
  return age >= limits.min && age <= limits.max;
} 