import { Locale, defaultLocale } from './locale';

// Cache for loaded translations
const translationCache: Record<string, Record<string, any>> = {};

export async function getDictionary(locale: Locale, namespace: string = 'common') {
  const cacheKey = `${locale}-${namespace}`;
  
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const dictionary = await import(`../../public/locales/${locale}/${namespace}.json`);
    translationCache[cacheKey] = dictionary.default;
    return dictionary.default;
  } catch (error) {
    console.warn(`Failed to load dictionary ${locale}/${namespace}:`, error);
    
    // Fallback to default locale if current locale fails
    if (locale !== defaultLocale) {
      try {
        const fallbackDictionary = await import(`../../public/locales/${defaultLocale}/${namespace}.json`);
        translationCache[cacheKey] = fallbackDictionary.default;
        return fallbackDictionary.default;
      } catch (fallbackError) {
        console.warn(`Failed to load fallback dictionary ${defaultLocale}/${namespace}:`, fallbackError);
      }
    }
    
    return {};
  }
}

export function createTranslator(dictionary: Record<string, any>) {
  return function t(key: string, fallback?: string): string {
    const keys = key.split('.');
    let value = dictionary;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    return fallback || key;
  };
}

// Utility to get multiple dictionaries at once
export async function getDictionaries(locale: Locale, namespaces: string[]) {
  const dictionaries: Record<string, any> = {};
  
  await Promise.all(
    namespaces.map(async (namespace) => {
      dictionaries[namespace] = await getDictionary(locale, namespace);
    })
  );
  
  return dictionaries;
} 