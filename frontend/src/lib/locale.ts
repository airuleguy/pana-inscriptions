export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromUrl(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  return isValidLocale(potentialLocale) ? potentialLocale : null;
}

export function removeLocaleFromUrl(pathname: string): string {
  const locale = getLocaleFromUrl(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

export function addLocaleToUrl(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromUrl(pathname);
  return `/${locale}${cleanPath}`;
}

export function getLocalePrefix(pathname: string): string {
  const locale = getLocaleFromUrl(pathname);
  return locale ? `/${locale}` : `/${defaultLocale}`;
} 