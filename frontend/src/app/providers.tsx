'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { RegistrationProvider } from '@/contexts/registration-context';
import { LanguageProvider } from '@/contexts/language-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <RegistrationProvider>
            {children}
          </RegistrationProvider>
        </AuthProvider>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          expand
          visibleToasts={3}
        />
      </ThemeProvider>
    </LanguageProvider>
  );
} 