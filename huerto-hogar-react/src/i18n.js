import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Load JSON resources
import es from './locales/es/common.json';
import en from './locales/en/common.json';
import fr from './locales/fr/common.json';

const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: saved || 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  });

export default i18n;
