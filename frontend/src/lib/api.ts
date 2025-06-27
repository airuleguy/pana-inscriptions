import { Gymnast, Choreography } from '@/types';

/**
 * API service for communicating with the backend
 * Replaces direct FIG API calls with backend endpoints
 */
export class APIService {
  private static readonly BASE_URL = ''; // Use relative URLs since Next.js will proxy to backend
  
  /**
   * Generic fetch wrapper with error handling
   */
  private static async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
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

  // ==================== CHOREOGRAPHIES ====================

  /**
   * Get all choreographies with optional country filter
   */
  static async getChoreographies(country?: string): Promise<Choreography[]> {
    const endpoint = country 
      ? `/api/v1/choreographies?country=${encodeURIComponent(country)}`
      : '/api/v1/choreographies';
    
    const backendChoreographies = await this.fetchAPI<any[]>(endpoint);
    return backendChoreographies.map(this.transformBackendToChoreography);
  }

  /**
   * Get choreography by ID
   */
  static async getChoreography(id: string): Promise<Choreography> {
    const backendChoreography = await this.fetchAPI<any>(`/api/v1/choreographies/${encodeURIComponent(id)}`);
    return this.transformBackendToChoreography(backendChoreography);
  }

  /**
   * Create a new choreography
   */
  static async createChoreography(choreography: Omit<Choreography, 'id' | 'registrationDate' | 'lastModified'>): Promise<Choreography> {
    const createDto = this.transformToCreateDto(choreography);
    
    const backendChoreography = await this.fetchAPI<any>('/api/v1/choreographies', {
      method: 'POST',
      body: JSON.stringify(createDto),
    });
    
    return this.transformBackendToChoreography(backendChoreography);
  }

  /**
   * Update choreography
   */
  static async updateChoreography(id: string, updates: Partial<Choreography>): Promise<Choreography> {
    const updateDto = this.transformToUpdateDto(updates);
    
    const backendChoreography = await this.fetchAPI<any>(`/api/v1/choreographies/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updateDto),
    });
    
    return this.transformBackendToChoreography(backendChoreography);
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
   * Transform backend FIG gymnast data to frontend format
   */
  private static transformFigToGymnast(fig: any): Gymnast {
    const dateOfBirth = new Date(fig.birthDate);
    const age = this.calculateAge(dateOfBirth);
    const category = this.determineCategory(age);
    
    return {
      id: fig.figId,
      firstName: fig.firstName,
      lastName: fig.lastName,
      fullName: `${fig.firstName} ${fig.lastName}`,
      dateOfBirth,
      gender: fig.gender === 'M' ? 'MALE' : 'FEMALE',
      country: fig.country,
      licenseValid: fig.isLicensed,
      licenseExpiryDate: new Date(), // Backend doesn't provide this yet
      age,
      category,
    };
  }

  /**
   * Transform backend choreography to frontend format
   */
  private static transformBackendToChoreography(backend: any): Choreography {
    return {
      id: backend.id,
      name: backend.name,
      category: backend.category as 'YOUTH' | 'JUNIOR' | 'SENIOR',
      countryCode: backend.country,
      selectedGymnasts: backend.gymnasts.map((fig: any) => this.transformFigToGymnast(fig)),
      gymnastCount: backend.gymnastCount,
      musicFile: undefined, // Not stored in backend yet
      musicFileName: undefined,
      routineDescription: backend.notes,
      registrationDate: new Date(backend.createdAt),
      lastModified: new Date(backend.updatedAt),
      status: 'SUBMITTED', // Backend doesn't have status yet
      submittedBy: undefined,
      notes: backend.notes,
    };
  }

  /**
   * Transform frontend choreography to backend create DTO
   */
  private static transformToCreateDto(choreography: any) {
    return {
      name: choreography.name,
      country: choreography.countryCode,
      category: choreography.category,
      type: this.determineChoreographyType(choreography.gymnastCount),
      gymnastCount: choreography.gymnastCount,
      oldestGymnastAge: this.getOldestGymnastAge(choreography.selectedGymnasts),
      gymnastFigIds: choreography.selectedGymnasts.map((g: Gymnast) => g.id),
      notes: choreography.routineDescription,
    };
  }

  /**
   * Transform frontend updates to backend update DTO
   */
  private static transformToUpdateDto(updates: any) {
    const dto: any = {};
    
    if (updates.name) dto.name = updates.name;
    if (updates.countryCode) dto.country = updates.countryCode;
    if (updates.category) dto.category = updates.category;
    if (updates.gymnastCount) {
      dto.gymnastCount = updates.gymnastCount;
      dto.type = this.determineChoreographyType(updates.gymnastCount);
    }
    if (updates.selectedGymnasts) {
      dto.gymnastFigIds = updates.selectedGymnasts.map((g: Gymnast) => g.id);
      dto.oldestGymnastAge = this.getOldestGymnastAge(updates.selectedGymnasts);
    }
    if (updates.routineDescription !== undefined) dto.notes = updates.routineDescription;
    
    return dto;
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

  private static determineCategory(age: number): 'YOUTH' | 'JUNIOR' | 'SENIOR' {
    if (age <= 15) return 'YOUTH';
    if (age <= 17) return 'JUNIOR';
    return 'SENIOR';
  }

  private static determineChoreographyType(gymnastCount: number): string {
    switch (gymnastCount) {
      case 1: return 'Individual';
      case 2: return 'Mixed Pair';
      case 3: return 'Trio';
      case 5: return 'Group';
      case 8: return 'Platform';
      default: throw new Error(`Invalid gymnast count: ${gymnastCount}`);
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
} 