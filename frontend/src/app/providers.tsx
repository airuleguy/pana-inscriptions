'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { RegistrationProvider } from '@/contexts/registration-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <RegistrationProvider>
        {children}
      </RegistrationProvider>
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