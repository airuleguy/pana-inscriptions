// FIG API Types removed - all FIG data now comes through backend API

// Application Types
import { ChoreographyCategory, VALID_CATEGORIES, AGE_LIMITS as CATEGORY_AGE_LIMITS } from '../constants/categories';

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
  category: ChoreographyCategory;
}

export interface Coach {
  id: string; // Maps to FIG coach ID
  firstName: string;
  lastName: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  country: string;
  level: string; // L1, L2, L3, LHB, LBR
  levelDescription: string; // Human-readable level description
  createdAt?: Date; // Registration date
  updatedAt?: Date; // Last modification date
}

export interface Judge {
  id: string; // Maps to FIG judge ID (idfig)
  firstName: string;
  lastName: string;
  fullName: string;
  birth: string; // ISO date string
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  country: string;
  category: string; // 1, 2, 3, 4
  categoryDescription: string; // Human-readable category description
  age: number; // Calculated age
  createdAt?: Date; // Registration date
  updatedAt?: Date; // Last modification date
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

export type ChoreographyType = 'MIND' | 'WIND' | 'MXP' | 'TRIO' | 'GRP' | 'DNCE';
export type TournamentType = 'CAMPEONATO_PANAMERICANO' | 'COPA_PANAMERICANA';

export interface Tournament {
  id: string;
  name: string;
  shortName: string;
  type: TournamentType;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  isActive: boolean;
  choreographies?: Choreography[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Choreography {
  id: string;
  name: string; // Auto-generated from gymnast surnames
  category: ChoreographyCategory;
  type: ChoreographyType; // Auto-determined from gymnast count and gender
  country: string; // Changed from countryCode to match backend
  tournament: Tournament;
  gymnasts: Gymnast[]; // Changed from selectedGymnasts to match backend
  gymnastCount: 1 | 2 | 3 | 5 | 8;
  oldestGymnastAge: number; // Added to match backend
  musicFile?: File;
  musicFileName?: string;
  notes?: string; // Changed from routineDescription to match backend
  createdAt: Date; // Changed from registrationDate to match backend
  updatedAt: Date; // Changed from lastModified to match backend
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'; // Made optional since backend doesn't have it yet
  submittedBy?: string;
}

export interface ChoreographyFormData {
  category: ChoreographyCategory;
  type: ChoreographyType;
  gymnastCount: 1 | 2 | 3 | 5 | 8;
  tournamentId: string;
  gymnasts: Gymnast[]; // Changed from selectedGymnasts to match backend
  musicFile?: File;
  notes?: string; // Changed from routineDescription to match backend
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

// Auth Types - Consolidated to match backend implementation
export interface User {
  id: string;
  username: string;
  country: string;
  role: 'DELEGATE' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Constants
export const GYMNAST_COUNTS = [1, 2, 3, 5, 8] as const;
export const CATEGORIES = VALID_CATEGORIES;
export const CHOREOGRAPHY_STATUS = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;
export const TOURNAMENT_TYPES = ['CAMPEONATO_PANAMERICANO', 'COPA_PANAMERICANA'] as const;

// Age limits for categories (based on FIG rules)
export const AGE_LIMITS = CATEGORY_AGE_LIMITS;

// Tournament type information
export const TOURNAMENT_TYPE_INFO = {
  CAMPEONATO_PANAMERICANO: { 
    name: "Campeonato Panamericano de Gimnasia Aeróbica",
    shortName: "Campeonato Panamericano",
    maxChoreographiesPerCategory: 2,
    description: "Premier Pan-American championship with strict eligibility"
  },
  COPA_PANAMERICANA: { 
    name: "Copa Panamericana de Gimnasia Aeróbica",
    shortName: "Copa Panamericana", 
    maxChoreographiesPerCategory: 4,
    description: "Developmental competition open to Pan-American and guest countries"
  }
} as const;

// Maximum choreographies per country per category (varies by tournament)
export const MAX_CHOREOGRAPHIES_PER_CATEGORY = {
  CAMPEONATO_PANAMERICANO: 2,
  COPA_PANAMERICANA: 4,
} as const;

// Choreography types - updated to match backend enum
export const CHOREOGRAPHY_TYPES = ['MIND', 'WIND', 'MXP', 'TRIO', 'GRP', 'DNCE'] as const;

// Choreography type information - updated to match backend
export const CHOREOGRAPHY_TYPE_INFO = {
  MIND: { name: "Men's Individual", count: 1 },
  WIND: { name: "Women's Individual", count: 1 },
  MXP: { name: "Mixed Pair", count: 2 },
  TRIO: { name: "Trio", count: 3 },
  GRP: { name: "Group", count: 5 },
  DNCE: { name: "Dance", count: 8 }
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  COUNTRIES: {
    key: 'countries_cache',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
} as const;

// Coach level information moved to APIService since it's only used for data transformation from backend 

// Registration Status Types
export type RegistrationStatus = 'PENDING' | 'SUBMITTED' | 'REGISTERED';

export const REGISTRATION_STATUS = ['PENDING', 'SUBMITTED', 'REGISTERED'] as const; 