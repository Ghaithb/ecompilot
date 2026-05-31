import { getCountryByCode } from './countries';

export function normalizeTunisianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('216') && digits.length >= 11) {
    return `+${digits.slice(0, 11)}`;
  }
  if (digits.length === 8) {
    return `+216${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 9) {
    return `+216${digits.slice(1)}`;
  }
  if (phone.startsWith('+216')) {
    return `+216${digits.slice(3, 11)}`;
  }
  return phone.trim();
}

export function isValidTunisianPhone(phone: string): boolean {
  const normalized = normalizeTunisianPhone(phone);
  return /^\+216[2-9]\d{7}$/.test(normalized);
}

/** Normalise vers E.164 (+XXXXXXXX) — local TN ou indicatif international */
export function normalizeInternationalPhone(phone: string, countryCode = 'TN'): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');
    return digits ? `+${digits}` : trimmed;
  }

  const country = getCountryByCode(countryCode);
  const local = trimmed.replace(/\D/g, '');
  if (country) {
    return `${country.dialCode}${local}`;
  }
  return normalizeTunisianPhone(trimmed);
}

/** Valide numéro local (pays sélectionné) ou format international (+216… / +33… etc.) */
export function isValidInternationalPhone(phone: string, countryCode = 'TN'): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('+')) {
    const normalized = normalizeInternationalPhone(trimmed);
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) return false;
    if (normalized.startsWith('+216')) {
      return /^\+216[2-9]\d{7}$/.test(normalized);
    }
    return true;
  }

  const country = getCountryByCode(countryCode);
  if (!country) return false;

  const local = trimmed.replace(/\D/g, '');
  if (country.code === 'TN') {
    return /^[2-9]\d{7}$/.test(local);
  }
  if (country.phonePattern) {
    return country.phonePattern.test(local);
  }
  if (country.phoneLength) {
    return local.length === country.phoneLength;
  }
  return /^\d{8,12}$/.test(local);
}

export function formatTunisianPhoneDisplay(phone: string): string {
  const normalized = normalizeTunisianPhone(phone);
  const local = normalized.replace('+216', '');
  if (local.length !== 8) return phone;
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
}
