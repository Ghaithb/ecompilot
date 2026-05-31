import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

const RTL_LANGS = ['ar'];

function getStoredLanguage(): string {
  try {
    return localStorage.getItem('selectedLanguage') || 'fr';
  } catch {
    return 'fr';
  }
}

/** Applique la direction (RTL/LTR) et la langue au document. */
export function applyDirection(lng: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = RTL_LANGS.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
}

export function isRtl(lng: string): boolean {
  return RTL_LANGS.includes(lng);
}

const initialLng = getStoredLanguage();

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: initialLng,
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'ar'],
  interpolation: { escapeValue: false },
});

applyDirection(initialLng);

i18n.on('languageChanged', (lng) => {
  applyDirection(lng);
  try {
    localStorage.setItem('selectedLanguage', lng);
  } catch {
    /* noop */
  }
});

export default i18n;
