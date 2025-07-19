/**
 * Utility functions for handling FIG image URLs
 */

export class FigImageUtil {
  private static readonly FIG_IMAGE_BASE_URL = 'https://www.gymnastics.sport/asset.php?id=bpic_';

  /**
   * Generate FIG image URL from FIG ID
   * @param figId The FIG ID of the entity
   * @returns The complete image URL or null if figId is invalid
   */
  static generateImageUrl(figId: string): string | null {
    if (!figId || figId.trim() === '') {
      return null;
    }
    
    // Remove any whitespace and ensure we have a valid ID
    const cleanFigId = figId.trim();
    
    // Generate the complete image URL
    return `${this.FIG_IMAGE_BASE_URL}${cleanFigId}`;
  }

  /**
   * Validate if a FIG image URL is properly formatted
   * @param imageUrl The image URL to validate
   * @returns True if the URL is valid, false otherwise
   */
  static isValidImageUrl(imageUrl: string): boolean {
    if (!imageUrl) return false;
    
    try {
      const url = new URL(imageUrl);
      return url.hostname === 'www.gymnastics.sport' && 
             url.pathname === '/asset.php' && 
             url.searchParams.get('id')?.startsWith('bpic_');
    } catch {
      return false;
    }
  }

  /**
   * Extract FIG ID from a FIG image URL
   * @param imageUrl The image URL to extract FIG ID from
   * @returns The FIG ID or null if extraction fails
   */
  static extractFigIdFromUrl(imageUrl: string): string | null {
    if (!this.isValidImageUrl(imageUrl)) {
      return null;
    }
    
    try {
      const url = new URL(imageUrl);
      const id = url.searchParams.get('id');
      if (id && id.startsWith('bpic_')) {
        return id.substring(5); // Remove 'bpic_' prefix
      }
    } catch {
      return null;
    }
    
    return null;
  }
} 