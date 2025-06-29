import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Gymnast, GYMNAST_COUNTS, ChoreographyType } from "@/types"
import { ChoreographyCategory } from "@/constants/categories"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate choreography name from gymnast surnames
 */
export function generateChoreographyName(gymnasts: Gymnast[]): string {
  if (gymnasts.length === 0) return "";
  
  return gymnasts
    .map(g => g.lastName.toUpperCase())
    .sort()
    .join('-');
}

/**
 * Validate gymnast count for choreography
 */
export function isValidGymnastCount(count: number): count is typeof GYMNAST_COUNTS[number] {
  return GYMNAST_COUNTS.includes(count as any);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date to short string
 */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date to DD/MM/YYYY format
 */
export function formatDateDDMMYYYY(date: Date): string {
  if (!date || isNaN(date.getTime())) return 'N/A';
  
  // Use UTC methods to avoid timezone issues since dates come from backend as UTC
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Calculate category based on the oldest gymnast's age
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
 * Get country flag emoji from country code
 */
export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function to limit function calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get category color for UI
 */
export function getCategoryColor(category: ChoreographyCategory): string {
  switch (category) {
    case ChoreographyCategory.YOUTH:
      return 'bg-green-100 text-green-800 border-green-200';
    case ChoreographyCategory.JUNIOR:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ChoreographyCategory.SENIOR:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get choreography type color for UI
 */
export function getChoreographyTypeColor(type: ChoreographyType): string {
  switch (type) {
    case 'MIND':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'WIND':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'MXP':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'TRIO':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'GRP':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'DNCE':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get choreography type display name
 */
export function getChoreographyTypeDisplayName(type: ChoreographyType): string {
  switch (type) {
    case 'MIND':
      return "Men's Individual";
    case 'WIND':
      return "Women's Individual";
    case 'MXP':
      return "Mixed Pair";
    case 'TRIO':
      return "Trio";
    case 'GRP':
      return "Group";
    case 'DNCE':
      return "Dance";
    default:
      return type;
  }
}

/**
 * Determine choreography type from gymnast count and gender composition
 */
export function determineChoreographyType(
  gymnastCount: number,
  gymnasts: Array<{ gender: 'MALE' | 'FEMALE' }>
): ChoreographyType {
  switch (gymnastCount) {
    case 1:
      // For individual, check gender
      const gymnast = gymnasts[0];
      return gymnast.gender === 'MALE' ? 'MIND' : 'WIND';
    case 2:
      return 'MXP';
    case 3:
      return 'TRIO';
    case 5:
      return 'GRP';
    case 8:
      return 'DNCE';
    default:
      throw new Error(`Invalid gymnast count: ${gymnastCount}`);
  }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'SUBMITTED':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
} 