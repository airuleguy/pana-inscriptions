import { I18nService } from 'nestjs-i18n';
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

export class I18nHelper {
  constructor(private readonly i18n: I18nService) {}

  // Translation helpers
  translate(key: string, options?: any): string {
    return this.i18n.translate(key, options);
  }

  // Common validation exceptions with translations
  throwBadRequest(translationKey: string, options?: any): never {
    const message = this.translate(translationKey, options);
    throw new BadRequestException(message);
  }

  throwNotFound(translationKey: string = 'validation.common.notFound', options?: any): never {
    const message = this.translate(translationKey, options);
    throw new NotFoundException(message);
  }

  throwUnauthorized(translationKey: string = 'validation.common.unauthorized', options?: any): never {
    const message = this.translate(translationKey, options);
    throw new UnauthorizedException(message);
  }

  throwForbidden(translationKey: string = 'validation.common.forbidden', options?: any): never {
    const message = this.translate(translationKey, options);
    throw new ForbiddenException(message);
  }

  // Validation message helpers
  getValidationMessage(field: string, validationType: string): string {
    const key = `validation.${field}.${validationType}`;
    return this.translate(key);
  }

  // Create success response with translated message
  createSuccessResponse(data: any, messageKey?: string): any {
    const response: any = { data };
    
    if (messageKey) {
      response.message = this.translate(messageKey);
    }
    
    return response;
  }
}