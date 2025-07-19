"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FigImageUtil = void 0;
class FigImageUtil {
    static generateImageUrl(figId) {
        if (!figId || figId.trim() === '') {
            return null;
        }
        const cleanFigId = figId.trim();
        return `${this.FIG_IMAGE_BASE_URL}${cleanFigId}`;
    }
    static isValidImageUrl(imageUrl) {
        if (!imageUrl)
            return false;
        try {
            const url = new URL(imageUrl);
            return url.hostname === 'www.gymnastics.sport' &&
                url.pathname === '/asset.php' &&
                url.searchParams.get('id')?.startsWith('bpic_');
        }
        catch {
            return false;
        }
    }
    static extractFigIdFromUrl(imageUrl) {
        if (!this.isValidImageUrl(imageUrl)) {
            return null;
        }
        try {
            const url = new URL(imageUrl);
            const id = url.searchParams.get('id');
            if (id && id.startsWith('bpic_')) {
                return id.substring(5);
            }
        }
        catch {
            return null;
        }
        return null;
    }
}
exports.FigImageUtil = FigImageUtil;
FigImageUtil.FIG_IMAGE_BASE_URL = 'https://www.gymnastics.sport/asset.php?id=bpic_';
//# sourceMappingURL=fig-image.util.js.map