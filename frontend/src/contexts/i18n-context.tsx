'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { getLocaleFromUrl, defaultLocale, type Locale } from '@/lib/locale';
import i18n from '@/lib/i18n';

interface I18nContextType {
  locale: Locale;
  t: (key: string, options?: any) => string;
  changeLanguage: (locale: Locale) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const pathname = usePathname();
  const { t, i18n: i18nInstance, ready } = useI18nTranslation();
  
  // Get current locale from URL or use initial locale
  const currentLocale = getLocaleFromUrl(pathname) || initialLocale || defaultLocale;
  
  // Update i18next language when locale changes
  useEffect(() => {
    if (ready && i18nInstance.language !== currentLocale) {
      i18nInstance.changeLanguage(currentLocale);
    }
  }, [currentLocale, i18nInstance, ready]);

  // Ensure i18n is initialized with the correct language on mount
  useEffect(() => {
    if (!ready && i18nInstance && currentLocale !== i18nInstance.language) {
      i18nInstance.changeLanguage(currentLocale);
    }
  }, [currentLocale, i18nInstance, ready]);

  const changeLanguage = (locale: Locale) => {
    if (i18nInstance) {
      i18nInstance.changeLanguage(locale);
    }
  };

  const value: I18nContextType = {
    locale: currentLocale,
    t,
    changeLanguage,
    isLoading: !ready,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Convenience hook that matches the existing API
export function useTranslations(namespace: string = 'common') {
  const { t: baseT, locale, isLoading } = useI18n();
  
  const t = (key: string, fallback?: string) => {
    const fullKey = namespace === 'common' ? key : `${namespace}:${key}`;
    const result = baseT(fullKey);
    
    // If the result equals the key, it means translation wasn't found
    if (result === fullKey && fallback) {
      return fallback;
    }
    
    return result;
  };

  return {
    t,
    locale,
    isLoading,
  };
} 