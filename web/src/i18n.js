import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation resources
import es from './locales/es.json';
import en from './locales/en.json';

/**
 * Initialize i18n with two languages.  Spanish (es) is the default and
 * English (en) is provided as a secondary language.  Additional keys can
 * be added to the translation files located in src/locales.  See
 * https://react.i18next.com/ for more details.
 */
i18n
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en }
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;