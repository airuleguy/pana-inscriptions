'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, setLanguage, getCurrentLanguage, getLanguageFromBrowser } from '@/lib/i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  changeLanguage: (newLanguage: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Try to get saved language from localStorage, fallback to browser language
        let savedLanguage = getCurrentLanguage();
        
        // If no saved language, detect from browser
        if (savedLanguage === 'en' && typeof window !== 'undefined' && !localStorage.getItem('language')) {
          savedLanguage = getLanguageFromBrowser();
        }
        
        setCurrentLanguage(savedLanguage);
        await setLanguage(savedLanguage);
      } catch (error) {
        console.warn('Failed to initialize language:', error);
        // Fallback to English
        setCurrentLanguage('en');
        await setLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    try {
      setCurrentLanguage(newLanguage);
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    changeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};