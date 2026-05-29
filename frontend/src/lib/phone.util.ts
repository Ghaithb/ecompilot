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

export function formatTunisianPhoneDisplay(phone: string): string {
  const normalized = normalizeTunisianPhone(phone);
  const local = normalized.replace('+216', '');
  if (local.length !== 8) return phone;
  return `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
}
