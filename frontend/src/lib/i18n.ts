import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { locales, defaultLocale, type Locale } from './locale';

// Import all translation files
import enCommon from '../../public/locales/en/common.json';
import enAuth from '../../public/locales/en/auth.json';
import enForms from '../../public/locales/en/forms.json';
import enHome from '../../public/locales/en/home.json';

import esCommon from '../../public/locales/es/common.json';
import esAuth from '../../public/locales/es/auth.json';
import esForms from '../../public/locales/es/forms.json';
import esHome from '../../public/locales/es/home.json';

// Resources object for i18next
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    forms: enForms,
    home: enHome,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    forms: esForms,
    home: esHome,
  },
};

// Initialize i18n only if it hasn't been initialized yet
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLocale,
      fallbackLng: defaultLocale,
      
      // Explicitly set supported languages
      supportedLngs: locales,
      nonExplicitSupportedLngs: false,
      
      // Debug only in development
      debug: process.env.NODE_ENV === 'development',
      
      // Namespace settings
      defaultNS: 'common',
      ns: ['common', 'auth', 'forms', 'home'],
      
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      // React-specific settings
      react: {
        useSuspense: false, // We'll handle loading states manually
      },
      
      // Disable automatic language detection since we handle it via URL
      detection: {
        order: [], // Disable automatic detection
      },
      
      // Support for server-side rendering
      initImmediate: false,
      
      // Ensure language loading is properly handled
      load: 'languageOnly',
      preload: locales,
    });
} else {
  // If already initialized, make sure resources are loaded for both languages
  locales.forEach(locale => {
    if (!i18n.hasResourceBundle(locale, 'common')) {
      i18n.addResourceBundle(locale, 'common', resources[locale].common);
      i18n.addResourceBundle(locale, 'auth', resources[locale].auth);
      i18n.addResourceBundle(locale, 'forms', resources[locale].forms);
      i18n.addResourceBundle(locale, 'home', resources[locale].home);
    }
  });
}

export default i18n;