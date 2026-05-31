/** Shared copy & defaults — Tunisia COD market */
export const COD_TRUST_LABELS = [
  'Livraison 24–72h',
  'COD disponible',
  'Retour 7 jours',
  'Support WhatsApp',
] as const;

export const COD_BENEFITS = [
  'Livraison rapide partout en Tunisie',
  'Payez à la réception — zéro risque',
  'Confirmation SMS avant expédition',
  'Support WhatsApp réactif',
] as const;

export const COD_FAQ = [
  { q: 'Comment payer ?', a: 'Paiement à la livraison (COD) — pas de carte requise.' },
  { q: 'Délai de livraison ?', a: '24 à 72h selon votre gouvernorat.' },
  { q: 'Puis-je retourner ?', a: 'Oui, retour sous 7 jours si produit non conforme.' },
] as const;

export const DEFAULT_TESTIMONIALS = [
  '« Livraison rapide, j\'ai payé à la réception comme promis. Je recommande ! »',
  '« Produit conforme, service WhatsApp très réactif. »',
] as const;

export const SERVICE_PACKAGES = [
  { name: 'Essentiel', price: 49, desc: 'Consultation · 30 min' },
  { name: 'Premium', price: 89, desc: 'Soin complet · 60 min' },
  { name: 'VIP', price: 129, desc: 'Expérience exclusive · 90 min' },
] as const;

export const WHATSAPP_COLOR = '#25D366';

export const STORE_ADVANTAGES = [
  {
    icon: 'truck' as const,
    title: 'Livraison rapide',
    description: '24–72h partout en Tunisie',
  },
  {
    icon: 'cod' as const,
    title: 'Paiement à la livraison',
    description: 'Payez après réception',
  },
  {
    icon: 'whatsapp' as const,
    title: 'Support WhatsApp',
    description: 'Réponse rapide 7j/7',
  },
] as const;
