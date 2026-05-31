/** Normalise un numéro tunisien vers +216XXXXXXXX */
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

/** Normalise vers E.164 — accepte +indicatif ou numéro local tunisien */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/\D/g, '');
    return digits ? `+${digits}` : trimmed;
  }
  return normalizeTunisianPhone(trimmed);
}

/** Valide numéro tunisien ou international (E.164) */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith('+216')) {
    return /^\+216[2-9]\d{7}$/.test(normalized);
  }
  if (normalized.startsWith('+')) {
    return /^\+[1-9]\d{7,14}$/.test(normalized);
  }
  return isValidTunisianPhone(normalized);
}

/** Valide un numéro mobile/fixe tunisien (8 chiffres après +216) */
export function isValidTunisianPhone(phone: string): boolean {
  const normalized = normalizeTunisianPhone(phone);
  return /^\+216[2-9]\d{7}$/.test(normalized);
}

export function formatTunisianPhoneDisplay(phone: string): string {
  const normalized = normalizeTunisianPhone(phone);
  const local = normalized.replace('+216', '');
  if (local.length !== 8) return phone;
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
}
