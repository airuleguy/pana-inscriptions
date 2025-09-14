import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './interfaces/storage.interface';
import { getMimeTypeFromBuffer, getExtensionFromMimeType } from '../utils/file-utils';

@Injectable()
export class S3Service implements IStorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
  }

  /**
   * Uploads a file to S3 and returns the URL
   * @param file The file buffer to upload
   * @param entityType The type of entity (e.g., 'support', 'gymnast')
   * @param entityId The ID of the entity
   * @returns The URL of the uploaded file
   */
  async uploadFile(
    file: Buffer,
    entityType: string,
    entityId: string,
  ): Promise<string> {
    const contentType = getMimeTypeFromBuffer(file);
    const extension = getExtensionFromMimeType(contentType);
    const key = `${entityType}/${entityId}${extension}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    return `${this.baseUrl}/${key}`;
  }

  /**
   * Deletes a file from S3
   * @param url The URL of the file to delete
   */
  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.baseUrl}/`, '');
    
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  /**
   * Gets a file from S3
   * @param url The URL of the file to get
   * @returns The file buffer
   */
  async getFile(url: string): Promise<Buffer> {
    const key = url.replace(`${this.baseUrl}/`, '');
    
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
