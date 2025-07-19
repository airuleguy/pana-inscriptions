import { useState, useEffect } from 'react';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

// Translation storage
let translations: Record<SupportedLanguage, Record<string, any>> = {
  en: {},
  es: {},
};

let currentLanguage: SupportedLanguage = 'en';

// Load translations dynamically
export const loadTranslations = async (locale: SupportedLanguage, namespace: string) => {
  try {
    const translation = await import(`../../public/locales/${locale}/${namespace}.json`);
    if (!translations[locale]) {
      translations[locale] = {};
    }
    translations[locale][namespace] = translation.default;
    return translation.default;
  } catch (error) {
    console.warn(`Failed to load translation ${locale}/${namespace}:`, error);
    return {};
  }
};

// Set current language
export const setLanguage = async (locale: SupportedLanguage) => {
  currentLanguage = locale;
  
  // Load common translations for the new language
  await Promise.all([
    loadTranslations(locale, 'common'),
    loadTranslations(locale, 'home'),
    loadTranslations(locale, 'auth'),
    loadTranslations(locale, 'forms'),
  ]);
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', locale);
  }
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language') as SupportedLanguage;
    if (stored && SUPPORTED_LANGUAGES.some(lang => lang.code === stored)) {
      return stored;
    }
  }
  return currentLanguage;
};

// Translation function with nested key support
export const t = (key: string, namespace: string = 'common'): string => {
  const lang = getCurrentLanguage();
  const keys = key.split('.');
  let value = translations[lang]?.[namespace];
  
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
  
  // Fallback to English if translation not found
  if (lang !== 'en') {
    let fallback = translations.en?.[namespace];
    for (const k of keys) {
      if (fallback && typeof fallback === 'object') {
        fallback = fallback[k];
      } else {
        break;
      }
    }
    if (typeof fallback === 'string') {
      return fallback;
    }
  }
  
  // Return key if no translation found
  return key;
};

// Hook for using translations in components
export const useTranslation = (namespace: string = 'common') => {
  const [language, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = getCurrentLanguage();
      setCurrentLanguage(savedLanguage);
      await setLanguage(savedLanguage);
      setIsLoading(false);
    };

    initializeLanguage();
  }, []);

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    setCurrentLanguage(newLanguage);
    await setLanguage(newLanguage);
  };

  return {
    t: (key: string) => t(key, namespace),
    language,
    changeLanguage,
    isLoading,
  };
};

// Language detection helpers
export const getLanguageFromBrowser = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang) ? browserLang : 'en';
};

export const getLanguageDisplayName = (code: SupportedLanguage): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.nativeName || code;
};