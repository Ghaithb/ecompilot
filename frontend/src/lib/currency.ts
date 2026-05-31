export const DEFAULT_CURRENCY = 'TND';
export const CURRENCY_SYMBOL = 'TND';

/**
 * Format a monetary amount for the Tunisian market.
 * Produces values like "120,00 TND" using French number grouping.
 */
export function formatTND(amount: number | null | undefined, decimals = 2): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return `${formatted} ${CURRENCY_SYMBOL}`;
}
