import { Gymnast, Coach, Judge, Choreography, ChoreographyType, Tournament, LoginCredentials, AuthResponse, User, CreateGymnastRequest } from '@/types';
import { ChoreographyCategory } from '@/constants/categories';

/**
 * API service for communicating with the backend
 * Replaces direct FIG API calls with backend endpoints
 */
export class APIService {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''; // Use backend URL from environment
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

      // Handle responses with no content (204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
      }

      // Check if response has JSON content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // For non-JSON responses, try to parse as text and return as string
      const text = await response.text();
      return (text || undefined) as T;
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
      await this.fetchAPI<void>('/api/v1/auth/logout', {
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
    
    // Transform backend data to frontend format
    return figGymnasts.map(fig => this.transformBackendToGymnast(fig));
  }

  /**
   * Get gymnast by FIG ID
   */
  static async getGymnastByFigId(figId: string): Promise<Gymnast | null> {
    try {
      const figGymnast = await this.fetchAPI<any>(`/api/v1/gymnasts/${encodeURIComponent(figId)}`);
      return figGymnast ? this.transformBackendToGymnast(figGymnast) : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new local gymnast
   */
  static async createLocalGymnast(gymnastData: CreateGymnastRequest): Promise<Gymnast> {
    const response = await this.fetchAPI<any>('/api/v1/gymnasts', {
      method: 'POST',
      body: JSON.stringify(gymnastData),
    });
    
    return this.transformBackendToGymnast(response);
  }

  /**
   * Clear gymnast cache on the backend
   */
  static async clearGymnastCache(): Promise<void> {
    await this.fetchAPI<void>('/api/v1/gymnasts/cache', { method: 'DELETE' });
  }

  // ==================== COACHES ====================

  /**
   * Get all licensed coaches with optional country filter
   */
  static async getCoaches(country?: string): Promise<Coach[]> {
    const endpoint = country 
      ? `/api/v1/coaches?country=${encodeURIComponent(country)}`
      : '/api/v1/coaches';
    
    const figCoaches = await this.fetchAPI<Coach[]>(endpoint);
    
    // Data is already transformed by backend - return directly
    return figCoaches;
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
    await this.fetchAPI<void>('/api/v1/coaches/cache', { method: 'DELETE' });
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
    
    const figJudges = await this.fetchAPI<Judge[]>(endpoint);
    
    // Data is already transformed by backend - return directly
    return figJudges;
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
    await this.fetchAPI<void>('/api/v1/judges/cache', { method: 'DELETE' });
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
    // Validate that all gymnasts have valid FIG IDs
    const invalidGymnasts = choreography.gymnasts.filter(g => !g.id || g.id.trim() === '');
    if (invalidGymnasts.length > 0) {
      const names = invalidGymnasts.map(g => `${g.firstName} ${g.lastName}`).join(', ');
      throw new Error(`The following gymnasts have missing or invalid FIG IDs: ${names}. Please refresh the gymnast data and try again.`);
    }

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
    // Validate that all gymnasts have valid FIG IDs
    const invalidGymnasts = choreography.gymnasts.filter(g => !g.figId || g.figId.trim() === '');
    if (invalidGymnasts.length > 0) {
      const names = invalidGymnasts.map(g => `${g.firstName} ${g.lastName}`).join(', ');
      throw new Error(`The following gymnasts have missing or invalid FIG IDs: ${names}. Please refresh the gymnast data and try again.`);
    }

    const createData = {
      name: choreography.name,
      country: choreography.country,
      category: choreography.category,
      type: choreography.type,
      gymnastCount: choreography.gymnastCount,
      oldestGymnastAge: this.getOldestGymnastAge(choreography.gymnasts),
      gymnastFigIds: choreography.gymnasts.map((g: Gymnast) => g.figId),
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
      // Validate that all gymnasts have valid FIG IDs
      const invalidGymnasts = updates.gymnasts.filter(g => !g.figId || g.figId.trim() === '');
      if (invalidGymnasts.length > 0) {
        const names = invalidGymnasts.map(g => `${g.firstName} ${g.lastName}`).join(', ');
        throw new Error(`The following gymnasts have missing or invalid FIG IDs: ${names}. Please refresh the gymnast data and try again.`);
      }
      
      updateData.gymnastFigIds = updates.gymnasts.map((g: Gymnast) => g.figId);
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
    await this.fetchAPI<void>(`/api/v1/choreographies/${encodeURIComponent(id)}`, {
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
   * Get pending registrations for a tournament (used for side summary sync)
   */
  static async getPendingRegistrations(tournamentId: string): Promise<{
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
    return await this.getRegistrationsByStatus(tournamentId, 'PENDING');
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
   * Transform backend gymnast data to application format (minimal transformation since backend now handles most)
   */
  private static transformBackendToGymnast(dto: {
    id: string;
    figId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE';
    country: string;
    dateOfBirth: string; // ISO timestamp from backend
    discipline: string;
    licenseValid: boolean;
    licenseExpiryDate: string; // ISO timestamp from backend
    age: number;
    category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
    isLocal?: boolean;
  }): Gymnast {
    // Validate that we have a valid figId
    if (!dto.figId || dto.figId.trim() === '') {
      console.warn(`Gymnast ${dto.firstName} ${dto.lastName} has invalid or missing figId:`, dto.figId);
    }
    
    return {
      id: dto.id, // Database UUID primary key
      figId: dto.figId, // FIG ID (idgymnastlicense)
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: dto.fullName,
      dateOfBirth: new Date(dto.dateOfBirth),
      gender: dto.gender,
      country: dto.country,
      licenseValid: dto.licenseValid,
      licenseExpiryDate: new Date(dto.licenseExpiryDate),
      age: dto.age,
      category: dto.category as ChoreographyCategory,
      isLocal: dto.isLocal || false,
    };
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

  // ============ IMAGE PROXY UTILITIES ============

  /**
   * Get proxied image URL for a FIG ID
   * This serves images through our backend cache for better performance
   */
  static getProxiedImageUrl(figId: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): string {
    if (!figId) return '';
    
    const params = new URLSearchParams();
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.quality) params.append('quality', options.quality.toString());
    
    const queryString = params.toString();
    const baseUrl = `${this.BASE_URL}/api/v1/images/fig/${figId}`;
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Get image information without downloading the image
   */
  static async getImageInfo(figId: string): Promise<{
    figId: string;
    imageUrl: string;
    proxyUrl: string;
    cached: boolean;
    contentType: string | null;
    contentLength: number | null;
    lastModified: string | null;
  }> {
    return this.fetchAPI(`/api/v1/images/fig/${figId}/info`);
  }

  /**
   * Preload multiple images into the backend cache
   * Useful for warming up the cache when displaying lists
   */
  static async preloadImages(figIds: string[]): Promise<{
    message: string;
    total: number;
    success: number;
    failed: number;
  }> {
    return this.fetchAPI('/api/v1/images/preload', {
      method: 'POST',
      body: JSON.stringify({ figIds }),
    });
  }

  /**
   * Clear image cache
   */
  static async clearImageCache(figId?: string): Promise<void> {
    const endpoint = figId ? `/api/v1/images/cache/${figId}` : '/api/v1/images/cache';
    await this.fetchAPI(endpoint, { method: 'DELETE' });
  }

  /**
   * Get image cache statistics
   */
  static async getImageCacheStats(): Promise<{
    message: string;
    cacheType: string;
    ttl: number;
  }> {
    return this.fetchAPI('/api/v1/images/cache/stats');
  }

  /**
   * Utility to preload images for a list of people (gymnasts, coaches, judges)
   */
  static async preloadPeopleImages<T extends { figId?: string; id?: string }>(people: T[]): Promise<void> {
    const figIds = people
      .map(person => person.figId || person.id)
      .filter((id): id is string => Boolean(id));

    if (figIds.length > 0) {
      try {
        await this.preloadImages(figIds);
        console.log(`Preloaded ${figIds.length} images`);
      } catch (error) {
        console.warn('Failed to preload images:', error);
      }
    }
  }
} 