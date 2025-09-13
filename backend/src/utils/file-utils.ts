/**
 * Gets the file extension for a given MIME type
 * @param mimeType The MIME type
 * @returns The file extension (including the dot)
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
  };

  return mimeToExt[mimeType] || '';
}

/**
 * Gets the MIME type from a buffer by checking its signature
 * @param buffer The file buffer
 * @returns The MIME type
 */
export function getMimeTypeFromBuffer(buffer: Buffer): string {
  // Check for PNG signature (89 50 4E 47 0D 0A 1A 0A)
  if (buffer[0] === 0x89 && 
      buffer[1] === 0x50 && 
      buffer[2] === 0x4E && 
      buffer[3] === 0x47 && 
      buffer[4] === 0x0D && 
      buffer[5] === 0x0A && 
      buffer[6] === 0x1A && 
      buffer[7] === 0x0A) {
    return 'image/png';
  }

  // Check for JPEG signature (FF D8 FF)
  if (buffer[0] === 0xFF && 
      buffer[1] === 0xD8 && 
      buffer[2] === 0xFF) {
    return 'image/jpeg';
  }

  // Check for GIF signatures ('GIF87a' or 'GIF89a')
  const gifString = buffer.toString('ascii', 0, 6);
  if (gifString === 'GIF87a' || gifString === 'GIF89a') {
    return 'image/gif';
  }

  return 'application/octet-stream';
}
