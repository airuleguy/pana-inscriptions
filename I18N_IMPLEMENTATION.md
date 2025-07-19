# Internationalization (i18n) Implementation

This document describes the internationalization implementation for the Panamerican Aerobic Gymnastics Championship registration system.

## Overview

The application supports multiple languages through a custom i18n solution for the frontend and NestJS i18n for the backend. Currently supported languages:
- **English** (en) - Default language
- **Spanish** (es)

## Frontend Implementation

### Technology Stack
- Custom i18n solution built for Next.js App Router
- React Context for language management
- Dynamic translation loading
- Language persistence in localStorage

### Directory Structure
```
frontend/
├── public/locales/
│   ├── en/
│   │   ├── common.json      # General terms, navigation, errors
│   │   ├── home.json        # Home page content
│   │   ├── auth.json        # Authentication related
│   │   └── forms.json       # Form labels and validation
│   └── es/
│       ├── common.json
│       ├── home.json
│       ├── auth.json
│       └── forms.json
├── src/
│   ├── lib/i18n.ts          # Core i18n functionality
│   ├── contexts/language-context.tsx  # Language state management
│   └── components/ui/language-switcher.tsx  # Language selector
```

### Usage Examples

#### Using translations in components:
```typescript
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation('common'); // Load 'common' namespace
  
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('general.loading')}</p>
    </div>
  );
}
```

#### Using the language context:
```typescript
import { useLanguage } from '@/contexts/language-context';

function LanguageInfo() {
  const { language, changeLanguage, isLoading } = useLanguage();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => changeLanguage('es')}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

#### Adding the language switcher:
```typescript
import { LanguageSwitcher } from '@/components/ui/language-switcher';

function Navigation() {
  return (
    <nav>
      <LanguageSwitcher variant="select" /> {/* Dropdown */}
      <LanguageSwitcher variant="button" /> {/* Button group */}
    </nav>
  );
}
```

### Translation File Structure

#### Common translations (common.json):
```json
{
  "general": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "login": "Login",
    "logout": "Logout"
  },
  "errors": {
    "general": "An error occurred. Please try again.",
    "required": "This field is required"
  }
}
```

## Backend Implementation

### Technology Stack
- nestjs-i18n library
- JSON translation files
- Automatic language detection from headers/query parameters

### Directory Structure
```
backend/
├── src/
│   ├── i18n/
│   │   ├── en/
│   │   │   └── validation.json    # Validation messages
│   │   └── es/
│   │       └── validation.json
│   ├── config/i18n.config.ts      # i18n configuration
│   └── utils/i18n.helper.ts       # Translation utilities
```

### Configuration

The i18n module is configured in `src/config/i18n.config.ts`:
```typescript
export const i18nConfig = I18nModule.forRoot({
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, '../i18n/'),
    watch: true,
  },
  resolvers: [
    { use: QueryResolver, options: ['lang'] },      // ?lang=es
    { use: HeaderResolver, options: ['accept-language'] },
    AcceptLanguageResolver,
  ],
});
```

### Usage Examples

#### In controllers:
```typescript
import { I18nService } from 'nestjs-i18n';

@Controller()
export class MyController {
  constructor(private readonly i18n: I18nService) {}

  @Get()
  async getData() {
    try {
      // Your logic here
      return data;
    } catch (error) {
      const message = this.i18n.translate('validation.common.notFound');
      throw new NotFoundException(message);
    }
  }
}
```

#### Using the helper service:
```typescript
import { I18nHelper } from '@/utils/i18n.helper';

@Injectable()
export class MyService {
  private i18nHelper: I18nHelper;

  constructor(i18n: I18nService) {
    this.i18nHelper = new I18nHelper(i18n);
  }

  async validateData(data: any) {
    if (!data.name) {
      this.i18nHelper.throwBadRequest('validation.gymnast.firstNameRequired');
    }
  }
}
```

## Adding New Languages

### 1. Update Language Configuration

#### Frontend:
Add the new language to `frontend/src/lib/i18n.ts`:
```typescript
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' }, // New language
] as const;
```

#### Backend:
The backend automatically supports new languages when translation files are added.

### 2. Create Translation Files

#### Frontend:
```bash
mkdir -p frontend/public/locales/pt
```

Create translation files:
- `frontend/public/locales/pt/common.json`
- `frontend/public/locales/pt/home.json`
- `frontend/public/locales/pt/auth.json`
- `frontend/public/locales/pt/forms.json`

#### Backend:
```bash
mkdir -p backend/src/i18n/pt
```

Create `backend/src/i18n/pt/validation.json`

### 3. Update Translation Loading

Add the new language to the `setLanguage` function in `frontend/src/lib/i18n.ts`:
```typescript
export const setLanguage = async (locale: SupportedLanguage) => {
  currentLanguage = locale;
  
  await Promise.all([
    loadTranslations(locale, 'common'),
    loadTranslations(locale, 'home'),
    loadTranslations(locale, 'auth'),
    loadTranslations(locale, 'forms'),
  ]);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', locale);
  }
};
```

### 4. Test the Implementation

1. Add the new language translations
2. Test the language switcher
3. Verify that all UI text is translated
4. Test backend API responses with the new language

## Translation Guidelines

### 1. Key Naming Conventions
- Use nested objects for organization: `navigation.home`, `forms.gymnast.title`
- Use descriptive keys: `hero.startRegistration` instead of `button1`
- Keep consistent naming across languages

### 2. Translation Best Practices
- Always provide fallbacks to English
- Use proper grammar and cultural context
- Consider text length differences between languages
- Use placeholders for dynamic content: `"hello {{name}}"`

### 3. Context-Specific Guidelines
- **Forms**: Include field labels, placeholders, validation messages
- **Navigation**: Keep menu items short and clear
- **Errors**: Provide helpful, actionable error messages
- **Success messages**: Use positive, clear language

## Browser Language Detection

The system automatically detects the user's browser language and selects the appropriate language if supported. If the browser language is not supported, it defaults to English.

## Language Persistence

The selected language is stored in localStorage and persists across browser sessions.

## Testing

### Frontend Testing
```bash
cd frontend
npm run dev
```

1. Test language switcher functionality
2. Verify translations appear correctly
3. Test browser language detection
4. Check language persistence

### Backend Testing
```bash
cd backend
npm run start:dev
```

Test API endpoints with language headers:
```bash
curl -H "Accept-Language: es" http://localhost:3001/api/v1/tournaments
curl http://localhost:3001/api/v1/tournaments?lang=es
```

## Performance Considerations

- Translations are loaded dynamically to reduce initial bundle size
- Language changes are cached in memory
- Only active namespace translations are loaded per component
- localStorage prevents unnecessary re-detection on page loads

## Future Enhancements

1. **RTL Language Support**: For Arabic, Hebrew, etc.
2. **Pluralization**: Advanced plural forms for different languages
3. **Date/Number Formatting**: Locale-specific formatting
4. **Translation Management**: Integration with translation services
5. **Lazy Loading**: Load translations only when needed

## Troubleshooting

### Common Issues

1. **Translations not loading**: Check file paths and JSON syntax
2. **Language switcher not working**: Verify context providers are properly wrapped
3. **Backend translations not working**: Check i18n module configuration
4. **Missing translations**: Fallback to English key should be displayed

### Debug Mode

Add console logging to track translation loading:
```typescript
const loadTranslations = async (locale: SupportedLanguage, namespace: string) => {
  try {
    console.log(`Loading ${locale}/${namespace}`);
    const translation = await import(`../../public/locales/${locale}/${namespace}.json`);
    // ... rest of implementation
  } catch (error) {
    console.warn(`Failed to load translation ${locale}/${namespace}:`, error);
    return {};
  }
};
```

## Contributing

When adding new features that include user-facing text:

1. Add translation keys to all supported languages
2. Use the translation hooks in components
3. Test with different languages
4. Update this documentation if needed

## Resources

- [React i18n Best Practices](https://react.i18next.com/)
- [NestJS i18n Documentation](https://nestjs-i18n.com/)
- [Unicode CLDR](http://cldr.unicode.org/) for locale data
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)