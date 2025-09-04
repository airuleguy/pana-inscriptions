import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios';
import { GymnastDto } from '../dto/gymnast.dto';
import { CoachDto } from '../dto/coach.dto';
import { JudgeDto } from '../dto/judge.dto';
import { FigImageUtil } from '../utils/fig-image.util';
import { calculateCategory, calculateCompetitionYearAge } from '../constants/categories';

interface FigApiGymnast {
  idgymnastlicense: string;
  gymnastid: string;
  discipline: string;
  validto: string;
  licensestatus: string;
  preferredlastname: string;
  preferredfirstname: string;
  birth: string;
  gender: string;
  country: string;
}

interface FigApiCoach {
  id: string;
  preferredlastname: string;
  preferredfirstname: string;
  country: string;
  gender: string;
  discipline: string;
  level: string;
}

interface FigApiJudge {
  idfig: string;
  discipline: string;
  category: string;
  preferredfirstname: string;
  preferredlastname: string;
  birth: string;
  gender: string;
  country: string;
}

@Injectable()
export class FigApiService {
  private readonly logger = new Logger(FigApiService.name);
  private readonly figApiUrl: string;
  private readonly figCoachApiUrl: string;
  private readonly figJudgeApiUrl: string;
  private readonly CACHE_KEY = 'fig-gymnasts';
  private readonly COACH_CACHE_KEY = 'fig-coaches';
  private readonly JUDGE_CACHE_KEY = 'fig-judges';
  private readonly CACHE_TTL: number;
  private readonly API_TIMEOUT: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const figApiConfig = this.configService.get('figApi');
    const cacheConfig = this.configService.get('cache');
    
    // Build URLs from configuration
    this.figApiUrl = `${figApiConfig.baseUrl}${figApiConfig.athletesEndpoint}`;
    this.figCoachApiUrl = `${figApiConfig.baseUrl}${figApiConfig.coachesEndpoint}`;
    this.figJudgeApiUrl = `${figApiConfig.baseUrl}${figApiConfig.judgesEndpoint}`;
    
    this.CACHE_TTL = cacheConfig.ttl;
    this.API_TIMEOUT = figApiConfig.timeout;
  }

  async getGymnasts(): Promise<GymnastDto[]> {
    try {
      // Try to get from cache first
      const cachedData = await this.cacheManager.get<GymnastDto[]>(this.CACHE_KEY);
      if (cachedData) {
        this.logger.debug('Returning cached FIG gymnast data');
        return cachedData;
      }

      // If not in cache, fetch from FIG API
      this.logger.log('Fetching gymnast data from FIG API');
      const apiUrl = `${this.figApiUrl}?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=`;
      const response: AxiosResponse<FigApiGymnast[]> = await axios.get(apiUrl, {
        timeout: this.API_TIMEOUT,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data to match frontend expectations at ingestion point
      const gymnasts: GymnastDto[] = response.data
        .map(athlete => this.transformFigApiGymnastToDto(athlete))
        .filter(gymnast => gymnast !== null);

      // Cache the result (TTL in milliseconds for cache-manager v5)
      await this.cacheManager.set(this.CACHE_KEY, gymnasts, this.CACHE_TTL * 1000);
      this.logger.log(`Cached ${gymnasts.length} gymnasts from FIG API`);

      return gymnasts;
    } catch (error) {
      this.logger.error('Failed to fetch gymnasts from FIG API', error);
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('FIG API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      throw new HttpException('Failed to fetch gymnast data', HttpStatus.BAD_GATEWAY);
    }
  }

  async getGymnastsByCountry(country: string): Promise<GymnastDto[]> {
    // OPTIMIZED: Always use cached data and filter in-memory for fast performance
    this.logger.debug(`Filtering cached gymnast data for country: ${country}`);
    const allGymnasts = await this.getGymnasts();
    return allGymnasts.filter(gymnast => 
      gymnast.country.toLowerCase() === country.toLowerCase()
    );
  }

  async getGymnastByFigId(figId: string): Promise<GymnastDto | null> {
    const allGymnasts = await this.getGymnasts();
    return allGymnasts.find(gymnast => gymnast.figId === figId) || null;
  }

  async clearCache(): Promise<void> {
    await this.cacheManager.del(this.CACHE_KEY);
    this.logger.log('FIG gymnast cache cleared');
  }

  // ==================== COACHES ====================

  async getCoaches(): Promise<CoachDto[]> {
    try {
      // Try to get from cache first
      const cachedData = await this.cacheManager.get<CoachDto[]>(this.COACH_CACHE_KEY);
      if (cachedData) {
        this.logger.debug('Returning cached FIG coach data');
        return cachedData;
      }

      // If not in cache, fetch from FIG API
      this.logger.log('Fetching coach data from FIG API');
      const apiUrl = `${this.figCoachApiUrl}?function=searchAcademic&discipline=AER&country=&id=&level=&lastname=&firstname=`;
      const response: AxiosResponse<FigApiCoach[]> = await axios.get(apiUrl, {
        timeout: this.API_TIMEOUT,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG Coach API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data to match frontend expectations at ingestion point
      const coaches: CoachDto[] = response.data.map(coach => this.transformFigApiCoachToDto(coach));

      // Cache the result (TTL in milliseconds for cache-manager v5)
      await this.cacheManager.set(this.COACH_CACHE_KEY, coaches, this.CACHE_TTL * 1000);
      this.logger.log(`Cached ${coaches.length} coaches from FIG API`);

      return coaches;
    } catch (error) {
      this.logger.error('Failed to fetch coaches from FIG API', error);
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG Coach API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('FIG Coach API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      throw new HttpException('Failed to fetch coach data', HttpStatus.BAD_GATEWAY);
    }
  }

  async getCoachesByCountry(country: string): Promise<CoachDto[]> {
    // OPTIMIZED: Always use cached data and filter in-memory for fast performance
    this.logger.debug(`Filtering cached coach data for country: ${country}`);
    const allCoaches = await this.getCoaches();
    return allCoaches.filter(coach => 
      coach.country.toLowerCase() === country.toLowerCase()
    );
  }

  async getCoachById(id: string): Promise<CoachDto | null> {
    const allCoaches = await this.getCoaches();
    return allCoaches.find(coach => coach.id === id) || null;
  }

  async clearCoachCache(): Promise<void> {
    await this.cacheManager.del(this.COACH_CACHE_KEY);
    this.logger.log('FIG coach cache cleared');
  }

  // ==================== JUDGES ====================

  async getJudges(): Promise<JudgeDto[]> {
    try {
      // Try to get from cache first
      const cachedData = await this.cacheManager.get<JudgeDto[]>(this.JUDGE_CACHE_KEY);
      if (cachedData) {
        this.logger.debug('Returning cached FIG judge data');
        return cachedData;
      }

      // If not in cache, fetch from FIG API
      this.logger.log('Fetching judge data from FIG API');
      const apiUrl = `${this.figJudgeApiUrl}?function=search&discipline=AER&country=&id=&category=&lastname=`;
      const response: AxiosResponse<FigApiJudge[]> = await axios.get(apiUrl, {
        timeout: this.API_TIMEOUT,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG Judge API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data to match frontend expectations at ingestion point
      const judges: JudgeDto[] = response.data.map(judge => this.transformFigApiJudgeToDto(judge));

      // Cache the result (TTL in milliseconds for cache-manager v5)
      await this.cacheManager.set(this.JUDGE_CACHE_KEY, judges, this.CACHE_TTL * 1000);
      this.logger.log(`Cached ${judges.length} judges from FIG API`);

      return judges;
    } catch (error) {
      this.logger.error('Failed to fetch judges from FIG API', error);
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG Judge API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('FIG Judge API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      throw new HttpException('Failed to fetch judge data', HttpStatus.BAD_GATEWAY);
    }
  }

  async getJudgesByCountry(country: string): Promise<JudgeDto[]> {
    // OPTIMIZED: Always use cached data and filter in-memory for fast performance
    this.logger.debug(`Filtering cached judge data for country: ${country}`);
    const allJudges = await this.getJudges();
    return allJudges.filter(judge => 
      judge.country.toLowerCase() === country.toLowerCase()
    );
  }

  async getJudgeById(id: string): Promise<JudgeDto | null> {
    const allJudges = await this.getJudges();
    return allJudges.find(judge => judge.id === id) || null;
  }

  async clearJudgeCache(): Promise<void> {
    await this.cacheManager.del(this.JUDGE_CACHE_KEY);
    this.logger.log('FIG judge cache cleared');
  }

  /**
   * Clear all FIG caches (gymnasts, coaches, judges)
   */
  async clearAllCaches(): Promise<void> {
    await Promise.all([
      this.cacheManager.del(this.CACHE_KEY),
      this.cacheManager.del(this.COACH_CACHE_KEY),
      this.cacheManager.del(this.JUDGE_CACHE_KEY),
    ]);
    this.logger.log('All FIG caches cleared');
  }

  /**
   * Get cache statistics for monitoring
   */
  async getCacheStats(): Promise<{
    message: string;
    cacheType: string;
    ttl: number;
    gymnasts: { cached: boolean; count?: number };
    coaches: { cached: boolean; count?: number };
    judges: { cached: boolean; count?: number };
  }> {
    const [gymnastsCache, coachesCache, judgesCache] = await Promise.all([
      this.cacheManager.get<GymnastDto[]>(this.CACHE_KEY),
      this.cacheManager.get<CoachDto[]>(this.COACH_CACHE_KEY),
      this.cacheManager.get<JudgeDto[]>(this.JUDGE_CACHE_KEY),
    ]);

    return {
      message: 'FIG API Cache with In-Memory Filtering',
      cacheType: 'Pre-loaded on startup, refreshed every 12h',
      ttl: this.CACHE_TTL,
      gymnasts: {
        cached: !!gymnastsCache,
        count: gymnastsCache?.length
      },
      coaches: {
        cached: !!coachesCache,
        count: coachesCache?.length
      },
      judges: {
        cached: !!judgesCache,
        count: judgesCache?.length
      },
    };
  }

  /**
   * Transform FIG API coach data to match frontend expectations at ingestion point
   * This ensures data consistency and acts as a facade between FIG API and our system
   */
  private transformFigApiCoachToDto(coach: FigApiCoach): CoachDto {
    // Transform gender to frontend format
    const gender: 'MALE' | 'FEMALE' = coach.gender.toLowerCase() === 'male' ? 'MALE' : 'FEMALE';
    
    // Generate full name
    const fullName = `${coach.preferredfirstname} ${coach.preferredlastname}`;
    
    // Generate level description
    const levelDescription = this.getCoachLevelDescription(coach.level);
    
    // Generate image URL from FIG ID
    const imageUrl = FigImageUtil.generateImageUrl(coach.id);
    
    return {
      id: coach.id,
      firstName: coach.preferredfirstname,
      lastName: coach.preferredlastname,
      fullName,
      gender,
      country: coach.country.toUpperCase(),
      discipline: coach.discipline,
      level: coach.level,
      levelDescription,
      imageUrl,
    };
  }

  /**
   * Transform FIG API judge data to match frontend expectations at ingestion point
   * This ensures data consistency and acts as a facade between FIG API and our system
   */
  private transformFigApiJudgeToDto(judge: FigApiJudge): JudgeDto {
    // Transform gender to frontend format
    const gender: 'MALE' | 'FEMALE' = judge.gender.toLowerCase() === 'male' ? 'MALE' : 'FEMALE';
    
    // Generate full name
    const fullName = `${judge.preferredfirstname} ${judge.preferredlastname}`;
    
    // Parse birth date and calculate age
    const dateOfBirth = new Date(judge.birth + 'T00:00:00Z');
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    // Generate category description
    const categoryDescription = this.getJudgeCategoryDescription(judge.category);
    
    // Generate image URL from FIG ID
    const imageUrl = FigImageUtil.generateImageUrl(judge.idfig);
    
    return {
      id: judge.idfig,
      firstName: judge.preferredfirstname,
      lastName: judge.preferredlastname,
      fullName,
      birth: judge.birth,
      dateOfBirth,
      gender,
      country: judge.country.toUpperCase(),
      discipline: judge.discipline,
      category: judge.category,
      categoryDescription,
      age,
      imageUrl,
    };
  }

  /**
   * Get human-readable description for coach level
   */
  private getCoachLevelDescription(level: string): string {
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
  private getJudgeCategoryDescription(category: string): string {
    const categoryMap: Record<string, string> = {
      '1': 'Category 1 (International Brevet)',
      '2': 'Category 2 (Regional)',
      '3': 'Category 3 (National)',
      '4': 'Category 4 (Candidate)',
    };
    return categoryMap[category] || `Category ${category}`;
  }

  /**
   * Transform FIG API gymnast data to match frontend expectations at ingestion point
   * This ensures data consistency and acts as a facade between FIG API and our system
   * Returns null if the gymnast has invalid or missing FIG ID
   */
  private transformFigApiGymnastToDto(athlete: FigApiGymnast): GymnastDto | null {
    // Validate required fields from FIG API
    if (!athlete.gymnastid || athlete.gymnastid.trim() === '') {
      this.logger.warn(`Gymnast ${athlete.preferredfirstname} ${athlete.preferredlastname} has invalid or missing gymnastid:`, athlete.gymnastid);
      // Skip gymnasts with missing FIG IDs as they cannot be used for registration
      return null;
    }
    
    // Parse license expiry date and check validity
    const licenseExpiryDate = new Date(athlete.validto + 'T00:00:00Z');
    const isLicenseValid = licenseExpiryDate > new Date();
    
    // Parse birth date
    const dateOfBirth = new Date(athlete.birth + 'T00:00:00Z');
    
    // Calculate competition year age (age athlete will turn during current year)
    const competitionAge = calculateCompetitionYearAge(dateOfBirth);
    
    // Determine category based on competition year age using centralized logic
    const category = calculateCategory(competitionAge) as 'YOUTH' | 'JUNIOR' | 'SENIOR';
    
    // Transform gender to frontend format
    const gender: 'MALE' | 'FEMALE' = athlete.gender === 'male' ? 'MALE' : 'FEMALE';
    
    // Generate full name
    const fullName = `${athlete.preferredfirstname} ${athlete.preferredlastname}`;
    
    // Generate image URL from FIG ID
    const imageUrl = FigImageUtil.generateImageUrl(athlete.gymnastid.trim());
    
    return {
      id: '', // Will be set by database
      figId: athlete.gymnastid.trim(),
      firstName: athlete.preferredfirstname,
      lastName: athlete.preferredlastname,
      fullName,
      gender,
      country: athlete.country.toUpperCase(),
      dateOfBirth,
      discipline: athlete.discipline,
      licenseValid: isLicenseValid,
      licenseExpiryDate,
      age: competitionAge,
      category,
      imageUrl,
    };
  }
} 