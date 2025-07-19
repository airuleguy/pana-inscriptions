'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { RegistrationProvider } from '@/contexts/registration-context';
import { I18nProvider } from '@/contexts/i18n-context';
import { type Locale } from '@/lib/locale';
// Initialize i18n
import '@/lib/i18n';

interface ProvidersProps {
  children: ReactNode;
  locale?: Locale;
}

export function Providers({ children, locale }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={locale}>
        <AuthProvider>
          <RegistrationProvider>
            {children}
          </RegistrationProvider>
        </AuthProvider>
      </I18nProvider>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand
        visibleToasts={3}
      />
    </ThemeProvider>
  );
} 