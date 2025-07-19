import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, isValidLocale } from './lib/locale';

function getLocaleFromRequest(request: NextRequest): string {
  // Check URL for locale
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().split('-')[0])
      .filter(lang => locales.includes(lang as any));
    
    if (preferredLocales.length > 0) {
      return preferredLocales[0];
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname already has a locale
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (isValidLocale(potentialLocale)) {
    // Add locale to request headers for the root layout
    const response = NextResponse.next();
    response.headers.set('x-locale', potentialLocale);
    return response;
  }

  // Skip API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Redirect to locale-prefixed URL
  const locale = getLocaleFromRequest(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, assets, api)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 