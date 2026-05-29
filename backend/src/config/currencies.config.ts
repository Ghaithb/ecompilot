export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  countries: string[];
  population: number;
  fixedRate?: number; // Taux fixe par rapport à EUR
  dynamicRate?: boolean; // Si taux variable
  minAmount: number; // Montant minimum
  decimals: number; // Nombre de décimales
}

export const AFRICAN_CURRENCIES: Record<string, CurrencyConfig> = {
  // Afrique Francophone Ouest (Zone UEMOA)
  XOF: {
    code: 'XOF',
    name: 'Franc CFA (BCEAO)',
    symbol: 'CFA',
    countries: ['SN', 'CI', 'BJ', 'TG', 'ML', 'BF', 'NE', 'GN'],
    population: 120000000,
    fixedRate: 655.957, // 1 EUR = 655.957 XOF
    minAmount: 1000,
    decimals: 0,
  },

  // Afrique Francophone Centre (Zone CEMAC)
  XAF: {
    code: 'XAF',
    name: 'Franc CFA (BEAC)',
    symbol: 'FCFA',
    countries: ['CM', 'GA', 'CG', 'TD', 'CF', 'GQ'],
    population: 50000000,
    fixedRate: 655.957, // 1 EUR = 655.957 XAF
    minAmount: 1000,
    decimals: 0,
  },

  // Nigeria (Plus grand marché africain)
  NGN: {
    code: 'NGN',
    name: 'Naira nigérian',
    symbol: '₦',
    countries: ['NG'],
    population: 220000000,
    dynamicRate: true,
    minAmount: 1000,
    decimals: 2,
  },

  // Ghana
  GHS: {
    code: 'GHS',
    name: 'Cedi ghanéen',
    symbol: '₵',
    countries: ['GH'],
    population: 31000000,
    dynamicRate: true,
    minAmount: 10,
    decimals: 2,
  },

  // Kenya
  KES: {
    code: 'KES',
    name: 'Shilling kenyan',
    symbol: 'KSh',
    countries: ['KE'],
    population: 55000000,
    dynamicRate: true,
    minAmount: 100,
    decimals: 2,
  },

  // Afrique du Sud
  ZAR: {
    code: 'ZAR',
    name: 'Rand sud-africain',
    symbol: 'R',
    countries: ['ZA'],
    population: 60000000,
    dynamicRate: true,
    minAmount: 10,
    decimals: 2,
  },

  // Maroc
  MAD: {
    code: 'MAD',
    name: 'Dirham marocain',
    symbol: 'DH',
    countries: ['MA'],
    population: 37000000,
    fixedRate: 10.8, // 1 EUR ≈ 10.8 MAD (approximatif)
    minAmount: 10,
    decimals: 2,
  },

  // Tunisie
  TND: {
    code: 'TND',
    name: 'Dinar tunisien',
    symbol: 'DT',
    countries: ['TN'],
    population: 12000000,
    dynamicRate: true,
    minAmount: 5,
    decimals: 3,
  },

  // Algérie
  DZD: {
    code: 'DZD',
    name: 'Dinar algérien',
    symbol: 'DA',
    countries: ['DZ'],
    population: 44000000,
    dynamicRate: true,
    minAmount: 100,
    decimals: 2,
  },

  // Égypte
  EGP: {
    code: 'EGP',
    name: 'Egyptian Pound',
    symbol: 'E£',
    countries: ['EG'],
    population: 110000000,
    dynamicRate: true,
    minAmount: 10,
    decimals: 2,
  },

  // Royaume-Uni
  GBP: {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    countries: ['GB'],
    population: 67000000,
    dynamicRate: true,
    minAmount: 1,
    decimals: 2,
  },

  // Suisse
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    countries: ['CH'],
    population: 8700000,
    dynamicRate: true,
    minAmount: 1,
    decimals: 2,
  },

  // Pologne
  PLN: {
    code: 'PLN',
    name: 'Polish Złoty',
    symbol: 'zł',
    countries: ['PL'],
    population: 38000000,
    dynamicRate: true,
    minAmount: 5,
    decimals: 2,
  },

  // Singapour
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    countries: ['SG'],
    population: 5700000,
    dynamicRate: true,
    minAmount: 1,
    decimals: 2,
  },

  // Malaisie
  MYR: {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    countries: ['MY'],
    population: 32000000,
    dynamicRate: true,
    minAmount: 5,
    decimals: 2,
  },

  // Thaïlande
  THB: {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    countries: ['TH'],
    population: 70000000,
    dynamicRate: true,
    minAmount: 10,
    decimals: 2,
  },

  // Vietnam
  VND: {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    countries: ['VN'],
    population: 98000000,
    dynamicRate: true,
    minAmount: 10000,
    decimals: 0, // Pas de centimes
  },

  // Philippines
  PHP: {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    countries: ['PH'],
    population: 110000000,
    dynamicRate: true,
    minAmount: 20,
    decimals: 2,
  },

  // Inde
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    countries: ['IN'],
    population: 1400000000,
    dynamicRate: true,
    minAmount: 50,
    decimals: 2,
  },

  // Devise de référence
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    countries: ['FR', 'BE', 'LU', 'etc'],
    population: 450000000,
    fixedRate: 1,
    minAmount: 1,
    decimals: 2,
  },

  USD: {
    code: 'USD',
    name: 'Dollar américain',
    symbol: '$',
    countries: ['US'],
    population: 330000000,
    dynamicRate: true,
    minAmount: 1,
    decimals: 2,
  },
};

// Pricing régional adapté au pouvoir d'achat
export const REGIONAL_PRICING = {
  // Zone Franc CFA Ouest (Sénégal, Côte d'Ivoire, etc.)
  XOF: {
    currency: 'XOF',
    region: 'West Africa',
    plans: {
      starter: {
        monthly: 15000, // ~23€
        yearly: 150000, // ~230€ (2 mois gratuits)
        features: ['1 site web', '10 produits', '100 commandes/mois', 'Support email'],
      },
      pro: {
        monthly: 30000, // ~46€
        yearly: 300000, // ~460€
        features: ['3 sites web', '100 produits', 'Commandes illimitées', 'Support prioritaire', 'Analytics avancés'],
      },
      business: {
        monthly: 60000, // ~92€
        yearly: 600000, // ~920€
        features: ['10 sites web', 'Produits illimités', 'Multi-utilisateurs', 'Support 24/7', 'API access', 'White label'],
      },
    },
  },

  // Zone Franc CFA Centre (Cameroun, Gabon, etc.)
  XAF: {
    currency: 'XAF',
    region: 'Central Africa',
    plans: {
      starter: { monthly: 15000, yearly: 150000 },
      pro: { monthly: 30000, yearly: 300000 },
      business: { monthly: 60000, yearly: 600000 },
    },
  },

  // Nigeria
  NGN: {
    currency: 'NGN',
    region: 'Nigeria',
    plans: {
      starter: { monthly: 15000, yearly: 150000 }, // ~20€
      pro: { monthly: 30000, yearly: 300000 },
      business: { monthly: 60000, yearly: 600000 },
    },
  },

  // Ghana
  GHS: {
    currency: 'GHS',
    region: 'Ghana',
    plans: {
      starter: { monthly: 250, yearly: 2500 }, // ~20€
      pro: { monthly: 500, yearly: 5000 },
      business: { monthly: 1000, yearly: 10000 },
    },
  },

  // Kenya
  KES: {
    currency: 'KES',
    region: 'Kenya',
    plans: {
      starter: { monthly: 2500, yearly: 25000 }, // ~18€
      pro: { monthly: 5000, yearly: 50000 },
      business: { monthly: 10000, yearly: 100000 },
    },
  },

  // Afrique du Sud
  ZAR: {
    currency: 'ZAR',
    region: 'South Africa',
    plans: {
      starter: { monthly: 299, yearly: 2990 }, // ~15€
      pro: { monthly: 599, yearly: 5990 },
      business: { monthly: 1199, yearly: 11990 },
    },
  },

  // Maroc
  MAD: {
    currency: 'MAD',
    region: 'Morocco',
    plans: {
      starter: { monthly: 200, yearly: 2000 }, // ~18€
      pro: { monthly: 400, yearly: 4000 },
      business: { monthly: 800, yearly: 8000 },
    },
  },

  // Tunisie
  TND: {
    currency: 'TND',
    region: 'Tunisia',
    plans: {
      starter: { monthly: 50, yearly: 500 }, // ~15€
      pro: { monthly: 100, yearly: 1000 },
      business: { monthly: 200, yearly: 2000 },
    },
  },

  // Algérie
  DZD: {
    currency: 'DZD',
    region: 'Algeria',
    plans: {
      starter: { monthly: 2500, yearly: 25000 }, // ~17€
      pro: { monthly: 5000, yearly: 50000 },
      business: { monthly: 10000, yearly: 100000 },
    },
  },

  // Égypte
  EGP: {
    currency: 'EGP',
    region: 'Egypt',
    plans: {
      starter: { monthly: 500, yearly: 5000 }, // ~16€
      pro: { monthly: 1000, yearly: 10000 },
      business: { monthly: 2000, yearly: 20000 },
    },
  },

  // Europe (par défaut)
  EUR: {
    currency: 'EUR',
    region: 'Europe',
    plans: {
      starter: { monthly: 29, yearly: 290 },
      pro: { monthly: 59, yearly: 590 },
      business: { monthly: 119, yearly: 1190 },
    },
  },
};

// Détection automatique de la devise selon le pays
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Zone Franc CFA Ouest
  SN: 'XOF', // Sénégal
  CI: 'XOF', // Côte d'Ivoire
  BJ: 'XOF', // Bénin
  TG: 'XOF', // Togo
  ML: 'XOF', // Mali
  BF: 'XOF', // Burkina Faso
  NE: 'XOF', // Niger
  GN: 'XOF', // Guinée-Bissau

  // Zone Franc CFA Centre
  CM: 'XAF', // Cameroun
  GA: 'XAF', // Gabon
  CG: 'XAF', // Congo
  TD: 'XAF', // Tchad
  CF: 'XAF', // Centrafrique
  GQ: 'XAF', // Guinée Équatoriale

  // Autres pays africains
  NG: 'NGN', // Nigeria
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // Afrique du Sud
  MA: 'MAD', // Maroc
  TN: 'TND', // Tunisie
  DZ: 'DZD', // Algérie
  EG: 'EGP', // Égypte

  // Europe
  FR: 'EUR',
  BE: 'EUR',
  LU: 'EUR',
  // ... autres pays EUR
};

export function getCurrencyByCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode] || 'EUR';
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = AFRICAN_CURRENCIES[currencyCode];
  if (!currency) return `${amount}`;

  const formatted = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });

  return `${formatted} ${currency.symbol}`;
}
