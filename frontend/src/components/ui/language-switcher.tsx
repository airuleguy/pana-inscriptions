'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageDisplayName, type SupportedLanguage } from '@/lib/i18n';
import { useLanguage } from '@/contexts/language-context';

interface LanguageSwitcherProps {
  variant?: 'select' | 'button';
  className?: string;
}

export function LanguageSwitcher({ variant = 'select', className }: LanguageSwitcherProps) {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (newLocale: string) => {
    changeLanguage(newLocale as SupportedLanguage);
  };

  if (variant === 'button') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(lang.code)}
            className="px-2 py-1 text-xs"
          >
            {lang.code.toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[100px]">
          <SelectValue>
            {getLanguageDisplayName(language)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}