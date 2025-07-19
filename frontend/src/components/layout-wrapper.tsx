'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { language } = useLanguage();

  useEffect(() => {
    // Update document language when language changes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return <>{children}</>;
}