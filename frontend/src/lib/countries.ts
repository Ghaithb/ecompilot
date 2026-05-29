/**
 * Liste des pays avec codes téléphoniques
 */

export interface Country {
  code: string; // Code ISO (FR, US, etc.)
  name: string;
  dialCode: string; // +33, +1, etc.
  flag: string; // Emoji drapeau
  phoneLength?: number; // Longueur attendue du numéro (sans indicatif)
  phonePattern?: RegExp; // Pattern de validation
}

export const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', phoneLength: 9, phonePattern: /^[1-9]\d{8}$/ },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪', phoneLength: 9, phonePattern: /^[1-9]\d{8}$/ },
  { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', phoneLength: 10, phonePattern: /^\d{10}$/ },
  { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸', phoneLength: 10, phonePattern: /^\d{10}$/ },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧', phoneLength: 10, phonePattern: /^\d{10}$/ },
  { code: 'DE', name: 'Allemagne', dialCode: '+49', flag: '🇩🇪', phoneLength: 10, phonePattern: /^\d{10,11}$/ },
  { code: 'ES', name: 'Espagne', dialCode: '+34', flag: '🇪🇸', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'IT', name: 'Italie', dialCode: '+39', flag: '🇮🇹', phoneLength: 10, phonePattern: /^\d{9,10}$/ },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'NL', name: 'Pays-Bas', dialCode: '+31', flag: '🇳🇱', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳', phoneLength: 8, phonePattern: /^\d{8}$/ },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', phoneLength: 9, phonePattern: /^\d{9}$/ },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮', phoneLength: 10, phonePattern: /^\d{10}$/ },
];

/**
 * Trouve un pays par son code
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * Trouve un pays par son indicatif
 */
export function getCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find(c => c.dialCode === dialCode);
}

/**
 * Valide un numéro de téléphone pour un pays donné
 */
export function validatePhoneNumber(phone: string, countryCode: string): boolean {
  const country = getCountryByCode(countryCode);
  if (!country) return false;

  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Vérifier le pattern si défini
  if (country.phonePattern) {
    return country.phonePattern.test(cleanPhone);
  }

  // Vérifier la longueur si définie
  if (country.phoneLength) {
    return cleanPhone.length === country.phoneLength;
  }

  // Par défaut, accepter entre 8 et 12 chiffres
  return /^\d{8,12}$/.test(cleanPhone);
}

/**
 * Formate un numéro de téléphone international
 */
export function formatPhoneNumber(phone: string, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;

  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return `${country.dialCode} ${cleanPhone}`;
}
