'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { locales, localeNames, type Locale, removeLocaleFromUrl, addLocaleToUrl, getLocaleFromUrl } from '@/lib/locale';

interface LanguageSwitcherProps {
  variant?: 'select' | 'button';
  className?: string;
}

export function LanguageSwitcher({ variant = 'select', className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get current locale from URL
  const currentLocale = getLocaleFromUrl(pathname) || 'en';

  const handleLanguageChange = (newLocale: Locale) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = removeLocaleFromUrl(pathname);
    const newPath = addLocaleToUrl(pathWithoutLocale, newLocale);
    
    router.push(newPath);
  };

  if (variant === 'button') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {locales.map((locale) => (
          <Button
            key={locale}
            variant={currentLocale === locale ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(locale)}
            className="px-2 py-1 text-xs"
          >
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLocale} onValueChange={(value) => handleLanguageChange(value as Locale)}>
        <SelectTrigger className="w-auto min-w-[100px]">
          <SelectValue>
            {localeNames[currentLocale]?.nativeName || currentLocale}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {localeNames[locale]?.nativeName || locale}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}