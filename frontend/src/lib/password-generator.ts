/**
 * Générateur de mot de passe fort
 */

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

export interface PasswordStrength {
  score: number; // 0-4
  label: string; // Très faible, Faible, Moyen, Fort, Très fort
  color: string;
  suggestions: string[];
}

/**
 * Génère un mot de passe aléatoire fort
 */
export function generateStrongPassword(length: number = 16): string {
  const allChars = LOWERCASE + UPPERCASE + NUMBERS + SYMBOLS;
  let password = '';

  // S'assurer d'avoir au moins un caractère de chaque type
  password += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
  password += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
  password += NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  password += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  // Remplir le reste avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mélanger les caractères
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Évalue la force d'un mot de passe
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Aucun',
      color: 'gray',
      suggestions: ['Entrez un mot de passe'],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Longueur
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) suggestions.push('Au moins 8 caractères');

  // Minuscules
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez des lettres minuscules');
  }

  // Majuscules
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez des lettres majuscules');
  }

  // Chiffres
  if (/\d/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez des chiffres');
  }

  // Symboles
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    score++;
  } else {
    suggestions.push('Ajoutez des symboles (!@#$...)');
  }

  // Caractères répétés
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Évitez les caractères répétés');
  }

  // Patterns communs
  const commonPatterns = ['123', 'abc', 'password', 'admin', 'qwerty'];
  const lowerPassword = password.toLowerCase();
  if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
    score = Math.max(0, score - 1);
    suggestions.push('Évitez les mots ou patterns courants');
  }

  // Normaliser le score sur 4
  const normalizedScore = Math.min(4, Math.floor((score / 6) * 4));

  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const colors = ['red', 'orange', 'yellow', 'green', 'emerald'];

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
    suggestions,
  };
}

/**
 * Copie le texte dans le presse-papiers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
