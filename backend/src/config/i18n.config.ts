import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

// Use process.cwd() for more reliable path resolution
// In production: process.cwd() + '/dist/i18n/'
// In development: process.cwd() + '/src/i18n/'
const isDevelopment = process.env.NODE_ENV !== 'production';
const i18nPath = isDevelopment 
  ? path.join(process.cwd(), 'src', 'i18n') 
  : path.join(process.cwd(), 'dist', 'i18n');

// Generate types in src/generated/ for both dev and prod, as this is a source file
const typesOutputPath = path.join(process.cwd(), 'src', 'generated', 'i18n.generated.ts');

export const i18nConfig = I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: i18nPath,
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },
    { use: HeaderResolver, options: ['accept-language'] },
    AcceptLanguageResolver,
  ],
  typesOutputPath,
});