'use client';

import { useEffect } from 'react';
import { useI18n } from '@/contexts/i18n-context';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { locale } = useI18n();

  useEffect(() => {
    // Update document language when locale changes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return <>{children}</>;
}