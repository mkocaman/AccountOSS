import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Fallback JSON translations
import trFallback from './locales/tr.json';
import enFallback from './locales/en.json';

// Resources object
const resources = {
  tr: {
    translation: trFallback
  },
  en: {
    translation: enFallback
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    debug: true,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    // Namespace ayarları
    defaultNS: 'translation',
    ns: ['translation']
  });

export default i18n;

