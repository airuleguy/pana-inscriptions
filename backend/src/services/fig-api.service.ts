import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios';
import { GymnastDto } from '../dto/gymnast.dto';
import { CoachDto } from '../dto/coach.dto';
import { JudgeDto } from '../dto/judge.dto';

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
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Base URLs for FIG APIs
    this.figApiUrl = 'https://www.gymnastics.sport/api/athletes.php';
    this.figCoachApiUrl = 'https://www.gymnastics.sport/api/coaches.php';
    this.figJudgeApiUrl = 'https://www.gymnastics.sport/api/judges.php';
  }

  async getGymnasts(): Promise<GymnastDto[]> {
    try {
      // Try to get from cache first
      const cachedData = await this.cacheManager.get<GymnastDto[]>(this.CACHE_KEY);
      if (cachedData) {
        this.logger.log('Returning cached FIG gymnast data');
        return cachedData;
      }

      // If not in cache, fetch from FIG API
      this.logger.log('Fetching gymnast data from FIG API');
      const apiUrl = `${this.figApiUrl}?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=`;
      const response: AxiosResponse<FigApiGymnast[]> = await axios.get(apiUrl, {
        timeout: 30000, // Increased timeout since API returns large dataset
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const gymnasts: GymnastDto[] = response.data.map(athlete => {
        // Parse license expiry date and check validity
        const licenseExpiryDate = new Date(athlete.validto + 'T00:00:00Z');
        const isLicenseValid = licenseExpiryDate > new Date();
        
        return {
          figId: athlete.gymnastid,
          firstName: athlete.preferredfirstname,
          lastName: athlete.preferredlastname,
          gender: athlete.gender === 'male' ? 'M' : 'F',
          country: athlete.country,
          birthDate: athlete.birth,
          discipline: athlete.discipline,
          isLicensed: isLicenseValid,
          licenseExpiryDate: athlete.validto,
        };
      });

      // Cache the result
      await this.cacheManager.set(this.CACHE_KEY, gymnasts, this.CACHE_TTL);
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
    try {
      // Try to get country-specific data from cache first
      const cacheKey = `${this.CACHE_KEY}-${country.toUpperCase()}`;
      const cachedData = await this.cacheManager.get<GymnastDto[]>(cacheKey);
      if (cachedData) {
        this.logger.log(`Returning cached FIG gymnast data for country: ${country}`);
        return cachedData;
      }

      // Fetch with country filter from FIG API
      this.logger.log(`Fetching gymnast data from FIG API for country: ${country}`);
      const countrySpecificUrl = `${this.figApiUrl}?function=searchLicenses&discipline=AER&country=${encodeURIComponent(country.toUpperCase())}&idlicense=&lastname=`;
      
      const response: AxiosResponse<FigApiGymnast[]> = await axios.get(countrySpecificUrl, {
        timeout: 30000,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const gymnasts: GymnastDto[] = response.data.map(athlete => {
        // Parse license expiry date and check validity
        const licenseExpiryDate = new Date(athlete.validto + 'T00:00:00Z');
        const isLicenseValid = licenseExpiryDate > new Date();
        
        return {
          figId: athlete.gymnastid,
          firstName: athlete.preferredfirstname,
          lastName: athlete.preferredlastname,
          gender: athlete.gender === 'male' ? 'M' : 'F',
          country: athlete.country,
          birthDate: athlete.birth,
          discipline: athlete.discipline,
          isLicensed: isLicenseValid,
          licenseExpiryDate: athlete.validto,
        };
      });

      // Cache the country-specific result
      await this.cacheManager.set(cacheKey, gymnasts, this.CACHE_TTL);
      this.logger.log(`Cached ${gymnasts.length} gymnasts from FIG API for country: ${country}`);

      return gymnasts;
    } catch (error) {
      this.logger.error(`Failed to fetch gymnasts from FIG API for country: ${country}`, error);
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('FIG API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      // Fallback to filtering all gymnasts
      this.logger.log(`Falling back to filtering all gymnasts for country: ${country}`);
      const allGymnasts = await this.getGymnasts();
      return allGymnasts.filter(gymnast => 
        gymnast.country.toLowerCase() === country.toLowerCase()
      );
    }
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
        this.logger.log('Returning cached FIG coach data');
        return cachedData;
      }

      // If not in cache, fetch from FIG API
      this.logger.log('Fetching coach data from FIG API');
      const apiUrl = `${this.figCoachApiUrl}?function=searchAcademic&discipline=AER&country=&id=&level=&lastname=&firstname=`;
      const response: AxiosResponse<FigApiCoach[]> = await axios.get(apiUrl, {
        timeout: 30000, // Increased timeout since API returns large dataset
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG Coach API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const coaches: CoachDto[] = response.data.map(coach => ({
        id: coach.id,
        firstName: coach.preferredfirstname,
        lastName: coach.preferredlastname,
        gender: coach.gender,
        country: coach.country,
        discipline: coach.discipline,
        level: coach.level,
      }));

      // Cache the result
      await this.cacheManager.set(this.COACH_CACHE_KEY, coaches, this.CACHE_TTL);
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
    try {
      // Try to get country-specific data from cache first
      const cacheKey = `${this.COACH_CACHE_KEY}-${country.toUpperCase()}`;
      const cachedData = await this.cacheManager.get<CoachDto[]>(cacheKey);
      if (cachedData) {
        this.logger.log(`Returning cached FIG coach data for country: ${country}`);
        return cachedData;
      }

      // Fetch with country filter from FIG API
      this.logger.log(`Fetching coach data from FIG API for country: ${country}`);
      const countrySpecificUrl = `${this.figCoachApiUrl}?function=searchAcademic&discipline=AER&country=${encodeURIComponent(country.toUpperCase())}&id=&level=&lastname=&firstname=`;
      
      const response: AxiosResponse<FigApiCoach[]> = await axios.get(countrySpecificUrl, {
        timeout: 30000,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG Coach API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const coaches: CoachDto[] = response.data.map(coach => ({
        id: coach.id,
        firstName: coach.preferredfirstname,
        lastName: coach.preferredlastname,
        gender: coach.gender,
        country: coach.country,
        discipline: coach.discipline,
        level: coach.level,
      }));

      // Cache the country-specific result
      await this.cacheManager.set(cacheKey, coaches, this.CACHE_TTL);
      this.logger.log(`Cached ${coaches.length} coaches from FIG API for country: ${country}`);

      return coaches;
    } catch (error) {
      this.logger.error(`Failed to fetch coaches from FIG API for country: ${country}`, error);
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG Coach API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('FIG Coach API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      // Fallback to filtering all coaches
      this.logger.log(`Falling back to filtering all coaches for country: ${country}`);
      const allCoaches = await this.getCoaches();
      return allCoaches.filter(coach => 
        coach.country.toLowerCase() === country.toLowerCase()
      );
    }
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
        this.logger.log('Returning cached FIG judge data');
        return cachedData;
      }

      // If not in cache, fetch from FIG API
      this.logger.log('Fetching judge data from FIG API');
      const apiUrl = `${this.figJudgeApiUrl}?function=search&discipline=AER&country=&id=&category=&lastname=`;
      const response: AxiosResponse<FigApiJudge[]> = await axios.get(apiUrl, {
        timeout: 30000, // Increased timeout since API returns large dataset
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG Judge API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const judges: JudgeDto[] = response.data.map(judge => ({
        id: judge.idfig,
        firstName: judge.preferredfirstname,
        lastName: judge.preferredlastname,
        birth: judge.birth,
        gender: judge.gender,
        country: judge.country,
        discipline: judge.discipline,
        category: judge.category,
      }));

      // Cache the result
      await this.cacheManager.set(this.JUDGE_CACHE_KEY, judges, this.CACHE_TTL);
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
    try {
      // Try to get country-specific data from cache first
      const cacheKey = `${this.JUDGE_CACHE_KEY}-${country.toUpperCase()}`;
      const cachedData = await this.cacheManager.get<JudgeDto[]>(cacheKey);
      if (cachedData) {
        this.logger.log(`Returning cached FIG judge data for country: ${country}`);
        return cachedData;
      }

      // Fetch with country filter from FIG API
      this.logger.log(`Fetching judge data from FIG API for country: ${country}`);
      const countrySpecificUrl = `${this.figJudgeApiUrl}?function=search&discipline=AER&country=${encodeURIComponent(country.toUpperCase())}&id=&category=&lastname=`;
      
      const response: AxiosResponse<FigApiJudge[]> = await axios.get(countrySpecificUrl, {
        timeout: 30000,
      });

      if (!Array.isArray(response.data)) {
        throw new HttpException('FIG Judge API returned unexpected data format', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const judges: JudgeDto[] = response.data.map(judge => ({
        id: judge.idfig,
        firstName: judge.preferredfirstname,
        lastName: judge.preferredlastname,
        birth: judge.birth,
        gender: judge.gender,
        country: judge.country,
        discipline: judge.discipline,
        category: judge.category,
      }));

      // Cache the country-specific result
      await this.cacheManager.set(cacheKey, judges, this.CACHE_TTL);
      this.logger.log(`Cached ${judges.length} judges from FIG API for country: ${country}`);

      return judges;
    } catch (error) {
      this.logger.error(`Failed to fetch judges from FIG API for country: ${country}`, error);
      
      if (error.response?.status === 429) {
        throw new HttpException('FIG Judge API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.code === 'TIMEOUT' || error.code === 'ECONNABORTED') {
        throw new HttpException('FIG Judge API timeout', HttpStatus.GATEWAY_TIMEOUT);
      }

      // Fallback to filtering all judges
      this.logger.log(`Falling back to filtering all judges for country: ${country}`);
      const allJudges = await this.getJudges();
      return allJudges.filter(judge => 
        judge.country.toLowerCase() === country.toLowerCase()
      );
    }
  }

  async getJudgeById(id: string): Promise<JudgeDto | null> {
    const allJudges = await this.getJudges();
    return allJudges.find(judge => judge.id === id) || null;
  }

  async clearJudgeCache(): Promise<void> {
    await this.cacheManager.del(this.JUDGE_CACHE_KEY);
    this.logger.log('FIG judge cache cleared');
  }
} 