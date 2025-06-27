import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosResponse } from 'axios';
import { GymnastDto } from '../dto/gymnast.dto';

interface FigApiResponse {
  status: string;
  data: Array<{
    id: string;
    first_name: string;
    last_name: string;
    gender: string;
    country: string;
    birth_date: string;
    discipline: string;
    license_status: string;
  }>;
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
    this.figApiUrl = this.configService.get<string>('FIG_API_URL') || 'https://www.gymnastics.sport/api/athletes.php';
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
      const response: AxiosResponse<FigApiResponse> = await axios.get(this.figApiUrl, {
        params: {
          discipline: 'AER',
          format: 'json',
        },
        timeout: 10000,
      });

      if (response.data.status !== 'success') {
        throw new HttpException('FIG API returned error status', HttpStatus.BAD_GATEWAY);
      }

      // Transform the data
      const gymnasts: GymnastDto[] = response.data.data.map(athlete => ({
        figId: athlete.id,
        firstName: athlete.first_name,
        lastName: athlete.last_name,
        gender: athlete.gender,
        country: athlete.country,
        birthDate: athlete.birth_date,
        discipline: athlete.discipline,
        isLicensed: athlete.license_status === 'active',
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
    const allGymnasts = await this.getGymnasts();
    return allGymnasts.filter(gymnast => 
      gymnast.country.toLowerCase() === country.toLowerCase() && gymnast.isLicensed
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
} 