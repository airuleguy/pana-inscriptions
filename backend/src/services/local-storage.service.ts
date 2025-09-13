import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './interfaces/storage.interface';
import { getMimeTypeFromBuffer, getExtensionFromMimeType } from '../utils/file-utils';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    // Create uploads directory in project root
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>('LOCAL_STORAGE_URL', 'http://localhost:3001/uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, entityType: string, entityId: string): Promise<string> {
    const entityDir = path.join(this.uploadDir, entityType);
    await fs.mkdir(entityDir, { recursive: true });

    const contentType = getMimeTypeFromBuffer(file);
    const extension = getExtensionFromMimeType(contentType);
    const fileName = `${entityId}${extension}`;
    const filePath = path.join(entityDir, fileName);
    await fs.writeFile(filePath, file);

    return `${this.baseUrl}/${entityType}/${fileName}`;
  }

  async deleteFile(url: string): Promise<void> {
    const relativePath = url.replace(this.baseUrl, '').replace(/^\//, '');
    const filePath = path.join(this.uploadDir, relativePath);

    try {
      await fs.unlink(filePath);
      
      // Clean up empty directories
      const dirPath = path.dirname(filePath);
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
      }
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
