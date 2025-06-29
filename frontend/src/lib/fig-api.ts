import { 
  FIGGymnast, 
  FIGCoach,
  Gymnast, 
  Coach,
  CacheData, 
  CACHE_CONFIG, 
  AGE_LIMITS,
  COACH_LEVEL_INFO
} from '@/types';
import { ChoreographyCategory } from '@/constants/categories';

/**
 * Service for interacting with the FIG (Fédération Internationale de Gymnastique) API
 * Handles caching, data transformation, and search functionality
 */
export class FIGAPIService {
  private static readonly BASE_URL = 'https://www.gymnastics.sport/api/athletes.php';
  private static readonly COACHES_BASE_URL = 'https://www.gymnastics.sport/api/coaches.php';
  
  /**
   * Fetch all AER gymnasts from FIG API
   * Implements caching to avoid repeated API calls
   */
  static async fetchAllGymnasts(): Promise<FIGGymnast[]> {
    const cached = this.getCachedData<FIGGymnast[]>(CACHE_CONFIG.FIG_GYMNASTS.key);
    if (cached) {
      console.log('FIG gymnasts loaded from cache');
      return cached;
    }

    try {
      console.log('Fetching gymnasts from FIG API...');
      const response = await fetch(
        `${this.BASE_URL}?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`FIG API error: ${response.status} ${response.statusText}`);
      }

      const data: FIGGymnast[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from FIG API');
      }

      console.log(`Fetched ${data.length} gymnasts from FIG API`);
      this.setCachedData(CACHE_CONFIG.FIG_GYMNASTS.key, data, CACHE_CONFIG.FIG_GYMNASTS.duration);
      
      return data;
    } catch (error) {
      console.error('Error fetching gymnasts from FIG API:', error);
      throw new Error('Failed to fetch gymnasts data. Please try again later.');
    }
  }

  /**
   * Get gymnasts filtered by country code
   */
  static async getGymnastsByCountry(countryCode: string): Promise<Gymnast[]> {
    const allGymnasts = await this.fetchAllGymnasts();
    return allGymnasts
      .filter(g => g.country === countryCode.toUpperCase())
      .map(this.transformToInternalFormat)
      .filter(g => g.licenseValid); // Only return valid licenses
  }

  /**
   * Search gymnasts by name with optional country filter
   */
  static async searchGymnasts(query: string, countryCode?: string): Promise<Gymnast[]> {
    const allGymnasts = await this.fetchAllGymnasts();
    let filtered = allGymnasts;
    
    // Filter by country if provided
    if (countryCode) {
      filtered = filtered.filter(g => g.country === countryCode.toUpperCase());
    }
    
    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(g => 
        g.preferredfirstname.toLowerCase().includes(searchTerm) ||
        g.preferredlastname.toLowerCase().includes(searchTerm) ||
        `${g.preferredfirstname} ${g.preferredlastname}`.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered
      .map(this.transformToInternalFormat)
      .filter(g => g.licenseValid)
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  /**
   * Get gymnasts by category and country
   */
  static async getGymnastsByCategory(
    category: ChoreographyCategory,
    countryCode: string
  ): Promise<Gymnast[]> {
    const countryGymnasts = await this.getGymnastsByCountry(countryCode);
    return countryGymnasts.filter(g => g.category === category);
  }

  /**
   * Get unique countries from gymnasts data
   */
  static async getAvailableCountries(): Promise<string[]> {
    const allGymnasts = await this.fetchAllGymnasts();
    const countries = new Set(allGymnasts.map(g => g.country));
    return Array.from(countries).sort();
  }

  /**
   * Fetch all AER coaches from FIG API
   * Implements caching to avoid repeated API calls
   */
  static async fetchAllCoaches(): Promise<FIGCoach[]> {
    const cached = this.getCachedData<FIGCoach[]>(CACHE_CONFIG.FIG_COACHES.key);
    if (cached) {
      console.log('FIG coaches loaded from cache');
      return cached;
    }

    try {
      console.log('Fetching coaches from FIG API...');
      const response = await fetch(
        `${this.COACHES_BASE_URL}?function=searchAcademic&discipline=AER&country=&id=&level=&lastname=&firstname=`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`FIG Coaches API error: ${response.status} ${response.statusText}`);
      }

      const data: FIGCoach[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from FIG Coaches API');
      }

      console.log(`Fetched ${data.length} coaches from FIG API`);
      this.setCachedData(CACHE_CONFIG.FIG_COACHES.key, data, CACHE_CONFIG.FIG_COACHES.duration);
      
      return data;
    } catch (error) {
      console.error('Error fetching coaches from FIG API:', error);
      throw new Error('Failed to fetch coaches data. Please try again later.');
    }
  }

  /**
   * Get coaches filtered by country code
   */
  static async getCoachesByCountry(countryCode: string): Promise<Coach[]> {
    const allCoaches = await this.fetchAllCoaches();
    return allCoaches
      .filter(c => c.country === countryCode.toUpperCase())
      .map(this.transformCoachToInternalFormat)
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  /**
   * Search coaches by name with optional country filter
   */
  static async searchCoaches(query: string, countryCode?: string): Promise<Coach[]> {
    const allCoaches = await this.fetchAllCoaches();
    let filtered = allCoaches;
    
    // Filter by country if provided
    if (countryCode) {
      filtered = filtered.filter(c => c.country === countryCode.toUpperCase());
    }
    
    // Filter by search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.preferredfirstname.toLowerCase().includes(searchTerm) ||
        c.preferredlastname.toLowerCase().includes(searchTerm) ||
        `${c.preferredfirstname} ${c.preferredlastname}`.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered
      .map(this.transformCoachToInternalFormat)
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }

  /**
   * Get coaches by level and country
   */
  static async getCoachesByLevel(
    level: string,
    countryCode: string
  ): Promise<Coach[]> {
    const countryCoaches = await this.getCoachesByCountry(countryCode);
    return countryCoaches.filter(c => c.level.includes(level));
  }

  /**
   * Get unique countries from coaches data
   */
  static async getAvailableCoachCountries(): Promise<string[]> {
    const allCoaches = await this.fetchAllCoaches();
    const countries = new Set(allCoaches.map(c => c.country));
    return Array.from(countries).sort();
  }

  /**
   * Clear coaches cache
   */
  static async clearCoachCache(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(CACHE_CONFIG.FIG_COACHES.key);
      console.log('FIG coaches cache cleared');
    } catch (error) {
      console.error('Error clearing coaches cache:', error);
    }
  }

  /**
   * Transform FIG API data to internal application format
   */
  private static transformToInternalFormat(fig: FIGGymnast): Gymnast {
    const dateOfBirth = new Date(fig.birth);
    const licenseExpiryDate = new Date(fig.validto);
    const age = this.calculateAge(dateOfBirth);
    const category = this.determineCategory(age);
    
    return {
      id: fig.idgymnastlicense,
      firstName: fig.preferredfirstname,
      lastName: fig.preferredlastname,
      fullName: `${fig.preferredfirstname} ${fig.preferredlastname}`,
      dateOfBirth,
      gender: fig.gender.toUpperCase() as 'MALE' | 'FEMALE',
      country: fig.country,
      licenseValid: licenseExpiryDate > new Date(),
      licenseExpiryDate,
      age,
      category,
    };
  }

  /**
   * Transform FIG Coach API data to internal application format
   */
  private static transformCoachToInternalFormat(fig: FIGCoach): Coach {
    return {
      id: fig.id,
      firstName: fig.preferredfirstname,
      lastName: fig.preferredlastname,
      fullName: `${fig.preferredfirstname} ${fig.preferredlastname}`,
      gender: fig.gender.toUpperCase() as 'MALE' | 'FEMALE',
      country: fig.country,
      level: fig.level,
      levelDescription: this.getCoachLevelDescription(fig.level),
    };
  }

  /**
   * Get human-readable description for coach level
   */
  private static getCoachLevelDescription(level: string): string {
    const levels = level.split(', ');
    const descriptions = levels.map(l => COACH_LEVEL_INFO[l as keyof typeof COACH_LEVEL_INFO] || l);
    return descriptions.join(', ');
  }

  /**
   * Calculate age from birth date
   */
  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Determine category based on age
   */
  private static determineCategory(age: number): ChoreographyCategory {
    if (age <= AGE_LIMITS.YOUTH.max) return ChoreographyCategory.YOUTH;
    if (age <= AGE_LIMITS.JUNIOR.max) return ChoreographyCategory.JUNIOR;
    return ChoreographyCategory.SENIOR;
  }

  /**
   * Get cached data from sessionStorage
   */
  private static getCachedData<T>(key: string): T | null {
    if (typeof window === 'undefined') return null; // SSR check
    
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;
      
      const { data, expiresAt }: CacheData<T> = JSON.parse(cached);
      
      if (Date.now() > expiresAt) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      sessionStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Set cached data in sessionStorage
   */
  private static setCachedData<T>(key: string, data: T, duration: number): void {
    if (typeof window === 'undefined') return; // SSR check
    
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + duration,
      };
      
      sessionStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Clear cache data
   */
  static clearCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(CACHE_CONFIG.FIG_GYMNASTS.key);
      sessionStorage.removeItem(CACHE_CONFIG.FIG_COACHES.key);
      sessionStorage.removeItem(CACHE_CONFIG.COUNTRIES.key);
      console.log('FIG API cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    figGymnasts: { cached: boolean; size?: number; expiresAt?: Date };
    figCoaches: { cached: boolean; size?: number; expiresAt?: Date };
  } {
    const figCache = this.getCachedData<FIGGymnast[]>(CACHE_CONFIG.FIG_GYMNASTS.key);
    const coachCache = this.getCachedData<FIGCoach[]>(CACHE_CONFIG.FIG_COACHES.key);
    
    return {
      figGymnasts: {
        cached: !!figCache,
        size: figCache?.length,
        expiresAt: figCache 
          ? new Date(Date.now() + CACHE_CONFIG.FIG_GYMNASTS.duration)
          : undefined,
      },
      figCoaches: {
        cached: !!coachCache,
        size: coachCache?.length,
        expiresAt: coachCache 
          ? new Date(Date.now() + CACHE_CONFIG.FIG_COACHES.duration)
          : undefined,
      },
    };
  }
} 