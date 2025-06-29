import { Gymnast, Coach, Judge, Choreography, ChoreographyType, Tournament, LoginCredentials, AuthResponse, User } from '@/types';
import { ChoreographyCategory } from '@/constants/categories';

/**
 * API service for communicating with the backend
 * Replaces direct FIG API calls with backend endpoints
 */
export class APIService {
  private static readonly BASE_URL = ''; // Use relative URLs since Next.js will proxy to backend
  private static authToken: string | null = null;
  
  /**
   * Set authentication token for API requests
   */
  static setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   */
  static getAuthToken(): string | null {
    return this.authToken;
  }
  
  /**
   * Generic fetch wrapper with error handling
   */
  private static async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    // Add authentication header if token is available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add any existing headers
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value;
        }
      });
    }
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          this.authToken = null;
          // Clear stored auth data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pana-auth-token');
            localStorage.removeItem('pana-auth-user');
          }
        }
        
        throw new Error(
          errorData?.message || 
          `API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Authenticate user with username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.fetchAPI<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Set token for subsequent requests
    this.setAuthToken(response.accessToken);
    
    return response;
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<AuthResponse> {
    const response = await this.fetchAPI<AuthResponse>('/api/v1/auth/refresh', {
      method: 'POST',
    });
    
    this.setAuthToken(response.accessToken);
    
    return response;
  }

  /**
   * Verify current token is valid
   */
  static async verifyToken(): Promise<User> {
    return await this.fetchAPI<User>('/api/v1/auth/verify');
  }

  /**
   * Logout user (optional backend call)
   */
  static async logout(): Promise<void> {
    try {
      await this.fetchAPI('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout errors - token will be cleared anyway
      console.warn('Logout request failed:', error);
    } finally {
      this.setAuthToken(null);
    }
  }

  // ==================== GYMNASTS ====================

  /**
   * Get all licensed gymnasts with optional country filter
   */
  static async getGymnasts(country?: string): Promise<Gymnast[]> {
    const endpoint = country 
      ? `/api/v1/gymnasts?country=${encodeURIComponent(country)}`
      : '/api/v1/gymnasts';
    
    const figGymnasts = await this.fetchAPI<any[]>(endpoint);
    
    // Transform FIG backend data to frontend format
    return figGymnasts.map(fig => this.transformFigToGymnast(fig));
  }

  /**
   * Get gymnast by FIG ID
   */
  static async getGymnastByFigId(figId: string): Promise<Gymnast | null> {
    try {
      const figGymnast = await this.fetchAPI<any>(`/api/v1/gymnasts/${encodeURIComponent(figId)}`);
      return figGymnast ? this.transformFigToGymnast(figGymnast) : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Clear gymnast cache on the backend
   */
  static async clearGymnastCache(): Promise<void> {
    await this.fetchAPI('/api/v1/gymnasts/cache', { method: 'DELETE' });
  }

  // ==================== COACHES ====================

  /**
   * Get all licensed coaches with optional country filter
   */
  static async getCoaches(country?: string): Promise<Coach[]> {
    const endpoint = country 
      ? `/api/v1/coaches?country=${encodeURIComponent(country)}`
      : '/api/v1/coaches';
    
    const figCoaches = await this.fetchAPI<any[]>(endpoint);
    
    // Transform FIG backend data to frontend format
    return figCoaches.map(fig => this.transformFigToCoach(fig));
  }

  /**
   * Search coaches by name and country
   */
  static async searchCoaches(query: string, country?: string): Promise<Coach[]> {
    // Get all coaches for the country, then filter client-side
    const coaches = await this.getCoaches(country);
    return this.searchCoachesLocal(coaches, query);
  }

  /**
   * Clear coach cache on the backend
   */
  static async clearCoachCache(): Promise<void> {
    await this.fetchAPI('/api/v1/coaches/cache', { method: 'DELETE' });
  }

  /**
   * Save coach selections (persist to database)
   */
  static async saveCoachSelections(coaches: Coach[], tournamentId: string): Promise<{
    success: boolean;
    results: Coach[];
    errors?: string[];
  }> {
    const registrationData = coaches.map(coach => ({
      figId: coach.id,
      firstName: coach.firstName,
      lastName: coach.lastName,
      fullName: coach.fullName,
      gender: coach.gender,
      country: coach.country,
      level: coach.level,
      levelDescription: coach.levelDescription,
      tournamentId: tournamentId,
    }));

    return await this.fetchAPI(`/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/coaches`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // ==================== JUDGES ====================

  /**
   * Get all certified judges with optional country filter
   */
  static async getJudges(country?: string): Promise<Judge[]> {
    const endpoint = country 
      ? `/api/v1/judges?country=${encodeURIComponent(country)}`
      : '/api/v1/judges';
    
    const figJudges = await this.fetchAPI<{
      id: string;
      firstName: string;
      lastName: string;
      birth: string;
      gender: string;
      country: string;
      category: string;
    }[]>(endpoint);
    
    // Transform FIG backend data to frontend format
    return figJudges.map(fig => this.transformFigToJudge(fig));
  }

  /**
   * Search judges by name and country
   */
  static async searchJudges(query: string, country?: string): Promise<Judge[]> {
    // Get all judges for the country, then filter client-side
    const judges = await this.getJudges(country);
    return this.searchJudgesLocal(judges, query);
  }

  /**
   * Clear judge cache on the backend
   */
  static async clearJudgeCache(): Promise<void> {
    await this.fetchAPI('/api/v1/judges/cache', { method: 'DELETE' });
  }

  /**
   * Save judge selections (persist to database)
   */
  static async saveJudgeSelections(judges: Judge[], tournamentId: string): Promise<{
    success: boolean;
    results: Judge[];
    errors?: string[];
  }> {
    const registrationData = judges.map(judge => ({
      figId: judge.id,
      firstName: judge.firstName,
      lastName: judge.lastName,
      fullName: judge.fullName,
      birth: judge.birth,
      gender: judge.gender,
      country: judge.country,
      category: judge.category,
      categoryDescription: judge.categoryDescription,
      tournamentId: tournamentId,
    }));

    return await this.fetchAPI(`/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/judges`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // ==================== CHOREOGRAPHIES ====================

  /**
   * Get all choreographies with optional country filter
   */
  static async getChoreographies(country?: string): Promise<Choreography[]> {
    const endpoint = country 
      ? `/api/v1/choreographies?country=${encodeURIComponent(country)}`
      : '/api/v1/choreographies';
    
    const choreographies = await this.fetchAPI<Choreography[]>(endpoint);
    return choreographies;
  }

  /**
   * Get choreography by ID
   */
  static async getChoreography(id: string): Promise<Choreography> {
    const choreography = await this.fetchAPI<Choreography>(`/api/v1/choreographies/${encodeURIComponent(id)}`);
    return choreography;
  }

  /**
   * Create new choreography
   */
  static async createChoreography(choreography: Omit<Choreography, 'id' | 'createdAt' | 'updatedAt'>, tournamentId: string): Promise<Choreography> {
    const createData = {
      name: choreography.name,
      country: choreography.country,
      category: choreography.category,
      type: choreography.type,
      gymnastCount: choreography.gymnastCount,
      oldestGymnastAge: this.getOldestGymnastAge(choreography.gymnasts),
      gymnastFigIds: choreography.gymnasts.map((g: Gymnast) => g.id),
      notes: choreography.notes,
      tournamentId: tournamentId,
    };

    const newChoreography = await this.fetchAPI<Choreography>('/api/v1/choreographies', {
      method: 'POST',
      body: JSON.stringify(createData),
    });

    return newChoreography;
  }

  /**
   * Register choreography for a specific tournament
   */
  static async registerChoreographyForTournament(choreography: Omit<Choreography, 'id' | 'createdAt' | 'updatedAt'>, tournamentId: string): Promise<{
    success: boolean;
    results: Choreography[];
    errors?: string[];
  }> {
    const createData = {
      name: choreography.name,
      country: choreography.country,
      category: choreography.category,
      type: choreography.type,
      gymnastCount: choreography.gymnastCount,
      oldestGymnastAge: this.getOldestGymnastAge(choreography.gymnasts),
      gymnastFigIds: choreography.gymnasts.map((g: Gymnast) => g.id),
      notes: choreography.notes,
      tournamentId: tournamentId,
    };

    return await this.fetchAPI(`/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/choreographies`, {
      method: 'POST',
      body: JSON.stringify(createData),
    });
  }

  /**
   * Update choreography
   */
  static async updateChoreography(id: string, updates: Partial<Choreography>): Promise<Choreography> {
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.country) updateData.country = updates.country;
    if (updates.category) updateData.category = updates.category;
    if (updates.type) updateData.type = updates.type;
    if (updates.gymnastCount) updateData.gymnastCount = updates.gymnastCount;
    if (updates.gymnasts) {
      updateData.gymnastFigIds = updates.gymnasts.map((g: Gymnast) => g.id);
      updateData.oldestGymnastAge = this.getOldestGymnastAge(updates.gymnasts);
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const updatedChoreography = await this.fetchAPI<Choreography>(`/api/v1/choreographies/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    return updatedChoreography;
  }

  /**
   * Delete choreography
   */
  static async deleteChoreography(id: string): Promise<void> {
    await this.fetchAPI(`/api/v1/choreographies/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get country statistics
   */
  static async getCountryStats(country: string): Promise<{
    totalChoreographies: number;
    byCategory: Record<'YOUTH' | 'JUNIOR' | 'SENIOR', number>;
  }> {
    return await this.fetchAPI(`/api/v1/choreographies/stats/${encodeURIComponent(country)}`);
  }

  // ==================== TOURNAMENTS ====================

  /**
   * Get all tournaments
   */
  static async getTournaments(): Promise<Tournament[]> {
    const tournaments = await this.fetchAPI<Tournament[]>('/api/v1/tournaments');
    return tournaments;
  }

  /**
   * Get tournament by ID
   */
  static async getTournament(id: string): Promise<Tournament> {
    const tournament = await this.fetchAPI<Tournament>(`/api/v1/tournaments/${encodeURIComponent(id)}`);
    return tournament;
  }

  // ==================== BATCH REGISTRATION ====================

  /**
   * Submit batch registration for choreographies, coaches, and judges
   */
  static async submitBatchRegistration(registrationData: {
    choreographies: Choreography[];
    coaches: Coach[];
    judges: Judge[];
    tournament: Tournament;
    country: string;
  }): Promise<{
    success: boolean;
    results: {
      choreographies: Choreography[];
      coaches: Coach[];
      judges: Judge[];
    };
    errors?: string[];
  }> {
    return await this.fetchAPI('/api/v1/registrations/batch', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  /**
   * Get existing registrations for a country and tournament
   */
  static async getExistingRegistrations(country: string, tournamentId: string): Promise<{
    choreographies: Choreography[];
    coaches: Coach[];
    judges: Judge[];
    totals: {
      choreographies: number;
      coaches: number;
      judges: number;
      total: number;
    };
  }> {
    return await this.fetchAPI(
      `/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations?country=${encodeURIComponent(country)}`
    );
  }

  /**
   * Get registration summary with totals and metadata
   */
  static async getRegistrationSummary(country: string, tournamentId: string): Promise<{
    choreographies: Choreography[];
    coaches: Coach[];
    judges: Judge[];
    totals: {
      choreographies: number;
      coaches: number;
      judges: number;
      total: number;
    };
    summary: {
      country: string;
      tournamentId: string;
      lastUpdated: Date;
      registrationStatus: string;
    };
  }> {
    return await this.fetchAPI(
      `/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/summary?country=${encodeURIComponent(country)}`
    );
  }

  // ==================== REGISTRATION STATUS MANAGEMENT ====================

  /**
   * Submit all pending registrations for a tournament
   */
  static async submitPendingRegistrations(tournamentId: string, notes?: string): Promise<{
    success: boolean;
    results: {
      choreographies: Choreography[];
      coaches: Coach[];
      judges: Judge[];
    };
    errors?: string[];
  }> {
    return await this.fetchAPI(`/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/submit`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  /**
   * Get registrations by status for a tournament
   */
  static async getRegistrationsByStatus(
    tournamentId: string, 
    status: 'PENDING' | 'SUBMITTED' | 'REGISTERED'
  ): Promise<{
    choreographies: Choreography[];
    coaches: Coach[];
    judges: Judge[];
    totals: {
      choreographies: number;
      coaches: number;
      judges: number;
      total: number;
    };
  }> {
    return await this.fetchAPI(`/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/status/${status}`);
  }

  /**
   * Update batch registration status (Admin only)
   */
  static async updateRegistrationsStatus(
    tournamentId: string,
    registrationIds: string[],
    status: 'PENDING' | 'SUBMITTED' | 'REGISTERED',
    notes?: string
  ): Promise<{
    success: boolean;
    updatedCount: number;
    errors?: string[];
  }> {
    return await this.fetchAPI(`/api/v1/tournaments/${encodeURIComponent(tournamentId)}/registrations/status/batch`, {
      method: 'PUT',
      body: JSON.stringify({
        registrationIds,
        status,
        notes,
      }),
    });
  }

  // ==================== EXISTING BATCH SUBMISSION ====================

  // ==================== HEALTH ====================

  /**
   * Check API health
   */
  static async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
  }> {
    return await this.fetchAPI('/health');
  }

  // ==================== TRANSFORMATION HELPERS ====================

  /**
   * Transform FIG gymnast data to application format
   */
  private static transformFigToGymnast(dto: {
    figId: string;
    firstName: string;
    lastName: string;
    gender: string; // 'M' or 'F' from backend
    country: string;
    birthDate: string; // ISO date string
    discipline: string;
    isLicensed: boolean;
    licenseExpiryDate: string; // YYYY-MM-DD format from backend
  }): Gymnast {
    const dateOfBirth = new Date(dto.birthDate + 'T00:00:00Z');
    const licenseExpiryDate = new Date(dto.licenseExpiryDate + 'T00:00:00Z');
    const age = this.calculateAge(dateOfBirth);
    const category = this.determineCategory(age);

    return {
      id: dto.figId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`,
      dateOfBirth,
      gender: dto.gender === 'M' ? 'MALE' : 'FEMALE',
      country: dto.country.toUpperCase(),
      licenseValid: dto.isLicensed,
      licenseExpiryDate,
      age,
      category,
    };
  }

  /**
   * Transform FIG coach data to application format
   */
  private static transformFigToCoach(dto: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string; // 'Male' or 'Female' from backend
    country: string;
    level: string;
  }): Coach {
    return {
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`,
      gender: dto.gender.toUpperCase() as 'MALE' | 'FEMALE',
      country: dto.country.toUpperCase(),
      level: dto.level,
      levelDescription: this.getCoachLevelDescription(dto.level),
    };
  }

  /**
   * Transform FIG judge data to application format
   */
  private static transformFigToJudge(dto: {
    id: string;
    firstName: string;
    lastName: string;
    birth: string;
    gender: string; // 'Male' or 'Female' from backend
    country: string;
    category: string;
  }): Judge {
    const dateOfBirth = new Date(dto.birth);
    const age = this.calculateAge(dateOfBirth);

    return {
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.lastName}`,
      birth: dto.birth,
      dateOfBirth,
      gender: dto.gender.toUpperCase() as 'MALE' | 'FEMALE',
      country: dto.country.toUpperCase(),
      category: dto.category,
      categoryDescription: this.getJudgeCategoryDescription(dto.category),
      age,
    };
  }

  /**
   * Get human-readable description for coach level
   */
  private static getCoachLevelDescription(level: string): string {
    const COACH_LEVEL_INFO = {
      'L1': 'Level 1 Coach',
      'L2': 'Level 2 Coach', 
      'L3': 'Level 3 Coach',
      'LHB': 'Level High Bronze Coach',
      'LBR': 'Level Bronze Coach'
    } as const;
    
    const levels = level.split(', ');
    const descriptions = levels.map(l => COACH_LEVEL_INFO[l as keyof typeof COACH_LEVEL_INFO] || l);
    return descriptions.join(', ');
  }

  /**
   * Get human-readable description for judge category
   */
  private static getJudgeCategoryDescription(category: string): string {
    const categoryMap: Record<string, string> = {
      '1': 'Category 1 (International Brevet)',
      '2': 'Category 2 (Regional)',
      '3': 'Category 3 (National)',
      '4': 'Category 4 (Candidate)',
    };
    return categoryMap[category] || `Category ${category}`;
  }

  // ==================== UTILITY HELPERS ====================

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private static determineCategory(age: number): ChoreographyCategory {
    if (age <= 15) return ChoreographyCategory.YOUTH;
    if (age <= 17) return ChoreographyCategory.JUNIOR;
    return ChoreographyCategory.SENIOR;
  }

  /**
   * Determine choreography type based on gymnast count and gender composition
   */
  private static determineChoreographyType(gymnastCount: number, gymnasts: Gymnast[]): ChoreographyType {
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

  private static getOldestGymnastAge(gymnasts: Gymnast[]): number {
    return Math.max(...gymnasts.map(g => g.age));
  }

  // ==================== SEARCH & FILTER HELPERS ====================

  /**
   * Search gymnasts by name (client-side filtering)
   */
  static searchGymnasts(gymnasts: Gymnast[], query: string): Gymnast[] {
    if (!query.trim()) return gymnasts;
    
    const searchTerm = query.toLowerCase().trim();
    return gymnasts.filter(g => 
      g.firstName.toLowerCase().includes(searchTerm) ||
      g.lastName.toLowerCase().includes(searchTerm) ||
      g.fullName.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filter gymnasts by category
   */
  static filterGymnastsByCategory(
    gymnasts: Gymnast[], 
    category: 'YOUTH' | 'JUNIOR' | 'SENIOR'
  ): Gymnast[] {
    return gymnasts.filter(g => g.category === category);
  }

  /**
   * Get unique countries from gymnasts (client-side)
   */
  static getUniqueCountries(gymnasts: Gymnast[]): string[] {
    const countries = new Set(gymnasts.map(g => g.country));
    return Array.from(countries).sort();
  }

  // ==================== COACH SEARCH & FILTER HELPERS ====================

  /**
   * Search coaches by name (client-side filtering)
   */
  static searchCoachesLocal(coaches: Coach[], query: string): Coach[] {
    if (!query.trim()) return coaches;
    
    const searchTerm = query.toLowerCase().trim();
    return coaches.filter(c => 
      c.firstName.toLowerCase().includes(searchTerm) ||
      c.lastName.toLowerCase().includes(searchTerm) ||
      c.fullName.toLowerCase().includes(searchTerm) ||
      c.levelDescription.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filter coaches by level
   */
  static filterCoachesByLevel(coaches: Coach[], level: string): Coach[] {
    return coaches.filter(c => c.level.includes(level));
  }

  /**
   * Get unique countries from coaches (client-side)
   */
  static getUniqueCoachCountries(coaches: Coach[]): string[] {
    const countries = new Set(coaches.map(c => c.country));
    return Array.from(countries).sort();
  }

  /**
   * Get unique levels from coaches (client-side)
   */
  static getUniqueCoachLevels(coaches: Coach[]): string[] {
    const levels = new Set<string>();
    coaches.forEach(c => {
      c.level.split(', ').forEach(level => levels.add(level.trim()));
    });
    return Array.from(levels).sort();
  }

  // ==================== JUDGE SEARCH & FILTER HELPERS ====================

  /**
   * Search judges by name (client-side filtering)
   */
  static searchJudgesLocal(judges: Judge[], query: string): Judge[] {
    if (!query.trim()) return judges;
    
    const searchTerm = query.toLowerCase().trim();
    return judges.filter(j => 
      j.firstName.toLowerCase().includes(searchTerm) ||
      j.lastName.toLowerCase().includes(searchTerm) ||
      j.fullName.toLowerCase().includes(searchTerm) ||
      j.categoryDescription.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filter judges by category
   */
  static filterJudgesByCategory(judges: Judge[], category: string): Judge[] {
    return judges.filter(j => j.category === category);
  }

  /**
   * Get unique countries from judges (client-side)
   */
  static getUniqueJudgeCountries(judges: Judge[]): string[] {
    const countries = new Set(judges.map(j => j.country));
    return Array.from(countries).sort();
  }

  /**
   * Get unique categories from judges (client-side)
   */
  static getUniqueJudgeCategories(judges: Judge[]): string[] {
    const categories = new Set(judges.map(j => j.category));
    return Array.from(categories).sort();
  }
} 