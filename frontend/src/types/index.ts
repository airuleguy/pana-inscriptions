// FIG API Types
export interface FIGGymnast {
  idgymnastlicense: string;
  gymnastid: string;
  discipline: 'AER';
  validto: string; // ISO date string
  licensestatus: string; // ISO date string
  preferredlastname: string;
  preferredfirstname: string;
  birth: string; // ISO date string
  gender: 'male' | 'female';
  country: string; // 3-letter country code
}

// Application Types
export interface Gymnast {
  id: string; // Maps to idgymnastlicense
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  country: string;
  licenseValid: boolean;
  licenseExpiryDate: Date;
  age: number;
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
}

export interface Country {
  code: string; // 3-letter ISO code
  name: string;
  flag?: string;
}

export interface Representative {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  countryCode: string;
  organization?: string;
}

export interface Choreography {
  id: string;
  name: string; // Auto-generated from gymnast surnames
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  countryCode: string;
  selectedGymnasts: Gymnast[];
  gymnastCount: 1 | 2 | 3 | 5 | 8;
  musicFile?: File;
  musicFileName?: string;
  routineDescription?: string;
  registrationDate: Date;
  lastModified: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedBy?: string;
  notes?: string;
}

export interface ChoreographyFormData {
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  gymnastCount: 1 | 2 | 3 | 5 | 8;
  selectedGymnasts: Gymnast[];
  musicFile?: File;
  routineDescription?: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form State Types
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

// Cache Types
export interface CacheData<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  countryCode: string;
  role: 'REPRESENTATIVE' | 'ADMIN';
  verified: boolean;
}

// Constants
export const GYMNAST_COUNTS = [1, 2, 3, 5, 8] as const;
export const CATEGORIES = ['YOUTH', 'JUNIOR', 'SENIOR'] as const;
export const CHOREOGRAPHY_STATUS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;

// Age limits for categories (based on FIG rules)
export const AGE_LIMITS = {
  YOUTH: { min: 0, max: 14 },
  JUNIOR: { min: 15, max: 17 },
  SENIOR: { min: 18, max: 100 }
} as const;

// Maximum choreographies per country per category
export const MAX_CHOREOGRAPHIES_PER_CATEGORY = 4;

// Cache configuration
export const CACHE_CONFIG = {
  FIG_GYMNASTS: {
    key: 'fig_gymnasts_cache',
    duration: 24 * 60 * 60 * 1000, // 24 hours
  },
  COUNTRIES: {
    key: 'countries_cache',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
} as const; 