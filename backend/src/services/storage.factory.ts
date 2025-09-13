import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './interfaces/storage.interface';
import { S3Service } from './s3.service';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class StorageFactory {
  constructor(
    private configService: ConfigService,
    private s3Service: S3Service,
    private localStorageService: LocalStorageService,
  ) {}

  getStorage(): IStorageService {
    const useLocalStorage = this.configService.get<boolean>('USE_LOCAL_STORAGE', process.env.NODE_ENV === 'development');
    return useLocalStorage ? this.localStorageService : this.s3Service;
  }
}
