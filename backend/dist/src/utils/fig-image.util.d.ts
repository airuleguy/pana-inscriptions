export declare class FigImageUtil {
    private static readonly FIG_IMAGE_BASE_URL;
    static generateImageUrl(figId: string): string | null;
    static isValidImageUrl(imageUrl: string): boolean;
    static extractFigIdFromUrl(imageUrl: string): string | null;
}
