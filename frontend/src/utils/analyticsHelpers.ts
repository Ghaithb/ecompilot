export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getTopProducts(products: any[], count: number = 10) {
  if (!Array.isArray(products)) return [];
  return products.sort((a, b) => b.revenue - a.revenue).slice(0, count);
}

export function filterByCategory(products: any[], category: string) {
  if (!Array.isArray(products) || category === 'all') return products;
  return products.filter(p => p.category === category);
}

export function filterByChannel(products: any[], channel: string) {
  if (!Array.isArray(products) || channel === 'all') return products;
  return products.filter(p => p.channel === channel);
}
