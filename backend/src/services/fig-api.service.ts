import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios';
import { GymnastDto } from '../dto/gymnast.dto';

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

@Injectable()
export class FigApiService {
  private readonly logger = new Logger(FigApiService.name);
  private readonly figApiUrl: string;
  private readonly CACHE_KEY = 'fig-gymnasts';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Base URL for FIG API - we'll add parameters dynamically
    this.figApiUrl = 'https://www.gymnastics.sport/api/athletes.php';
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
      const gymnasts: GymnastDto[] = response.data.map(athlete => ({
        figId: athlete.gymnastid,
        firstName: athlete.preferredfirstname,
        lastName: athlete.preferredlastname,
        gender: athlete.gender === 'male' ? 'M' : 'F',
        country: athlete.country,
        birthDate: athlete.birth,
        discipline: athlete.discipline,
        isLicensed: true, // All gymnasts in the API have valid licenses
      }));

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
      const gymnasts: GymnastDto[] = response.data.map(athlete => ({
        figId: athlete.gymnastid,
        firstName: athlete.preferredfirstname,
        lastName: athlete.preferredlastname,
        gender: athlete.gender === 'male' ? 'M' : 'F',
        country: athlete.country,
        birthDate: athlete.birth,
        discipline: athlete.discipline,
        isLicensed: true,
      }));

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
} 