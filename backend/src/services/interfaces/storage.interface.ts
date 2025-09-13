export interface IStorageService {
  uploadFile(file: Buffer, entityType: string, entityId: string): Promise<string>;
  deleteFile(url: string): Promise<void>;
}
