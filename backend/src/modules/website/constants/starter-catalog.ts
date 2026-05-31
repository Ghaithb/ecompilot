export type ShopNiche = 'general' | 'mode' | 'tech' | 'maison' | 'beaute';

export type StarterProductDef = {
  title: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  imageUrl: string;
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

export const STARTER_CATALOG: Record<ShopNiche, StarterProductDef[]> = {
  general: [
    {
      title: 'Produit Best-Seller',
      description: 'Notre article le plus demandé — qualité premium, livraison COD partout en Tunisie.',
      category: 'Général',
      price: 49.99,
      sku: 'START-GEN-001',
      imageUrl: img('starter-general-1'),
    },
    {
      title: 'Pack Découverte',
      description: 'Idéal pour tester la boutique — paiement à la réception, sans risque.',
      category: 'Général',
      price: 79.99,
      sku: 'START-GEN-002',
      imageUrl: img('starter-general-2'),
    },
    {
      title: 'Offre Lancement',
      description: 'Prix spécial lancement — stock limité.',
      category: 'Général',
      price: 39.99,
      sku: 'START-GEN-003',
      imageUrl: img('starter-general-3'),
    },
  ],
  mode: [
    {
      title: 'T-shirt Coton Premium',
      description: '100% coton, coupe confortable. Tailles S à XL.',
      category: 'Mode',
      price: 39.99,
      sku: 'START-MOD-001',
      imageUrl: img('starter-mode-tshirt'),
    },
    {
      title: 'Sneakers Urban',
      description: 'Baskets légères et tendance — parfait pour le quotidien.',
      category: 'Mode',
      price: 129,
      sku: 'START-MOD-002',
      imageUrl: img('starter-mode-sneakers'),
    },
    {
      title: 'Robe Élégante',
      description: 'Robe fluide pour toutes occasions — tissu premium.',
      category: 'Mode',
      price: 89.99,
      sku: 'START-MOD-003',
      imageUrl: img('starter-mode-dress'),
    },
  ],
  tech: [
    {
      title: 'Montre Connectée',
      description: 'Suivi activité, notifications, autonomie 7 jours.',
      category: 'Tech',
      price: 199,
      sku: 'START-TEC-001',
      imageUrl: img('starter-tech-watch'),
    },
    {
      title: 'Écouteurs Bluetooth',
      description: 'Son HD, réduction de bruit, boîtier de charge inclus.',
      category: 'Tech',
      price: 79.99,
      sku: 'START-TEC-002',
      imageUrl: img('starter-tech-buds'),
    },
    {
      title: 'Chargeur Rapide',
      description: 'Charge rapide USB-C — compatible smartphones récents.',
      category: 'Tech',
      price: 34.99,
      sku: 'START-TEC-003',
      imageUrl: img('starter-tech-charger'),
    },
  ],
  maison: [
    {
      title: 'Set Cuisine Inox',
      description: 'Casseroles et poêles inox — compatible tous feux.',
      category: 'Maison',
      price: 149,
      sku: 'START-HOM-001',
      imageUrl: img('starter-home-kitchen'),
    },
    {
      title: 'Diffuseur Parfum',
      description: 'Ambiance parfumée durable pour salon ou chambre.',
      category: 'Maison',
      price: 59.99,
      sku: 'START-HOM-002',
      imageUrl: img('starter-home-diffuser'),
    },
    {
      title: 'Plaid Déco Soft',
      description: 'Plaid doux et élégant — plusieurs coloris.',
      category: 'Maison',
      price: 45,
      sku: 'START-HOM-003',
      imageUrl: img('starter-home-plaid'),
    },
  ],
  beaute: [
    {
      title: 'Crème Visage Bio',
      description: 'Hydratation intense — peaux normales à sèches, 50 ml.',
      category: 'Beauté',
      price: 34.99,
      sku: 'START-BEA-001',
      imageUrl: img('starter-beauty-cream'),
    },
    {
      title: 'Sérum Vitamine C',
      description: 'Éclat et anti-taches — formule légère, résultats visibles.',
      category: 'Beauté',
      price: 42.99,
      sku: 'START-BEA-002',
      imageUrl: img('starter-beauty-serum'),
    },
    {
      title: 'Huile Argan Pure',
      description: '100% argan tunisien — cheveux et peau.',
      category: 'Beauté',
      price: 29.99,
      sku: 'START-BEA-003',
      imageUrl: img('starter-beauty-oil'),
    },
  ],
};

export function resolveShopNiche(raw?: string): ShopNiche {
  const n = (raw || 'general').toLowerCase();
  if (n in STARTER_CATALOG) return n as ShopNiche;
  return 'general';
}
