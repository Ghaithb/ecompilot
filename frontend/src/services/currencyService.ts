import { api } from '@/lib/api';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  countries: string[];
  population: number;
  minAmount: number;
  decimals: number;
}

export interface ConversionResult {
  original: {
    amount: number;
    currency: string;
    formatted: string;
  };
  converted: {
    amount: number;
    currency: string;
    formatted: string;
  };
  rate: number;
}

export interface RegionalPricing {
  currency: string;
  region: string;
  plans: {
    starter: {
      monthly: number;
      yearly: number;
      features: string[];
    };
    pro: {
      monthly: number;
      yearly: number;
      features: string[];
    };
    business: {
      monthly: number;
      yearly: number;
      features: string[];
    };
  };
}

class CurrencyService {
  async convert(amount: number, from: string, to: string): Promise<ConversionResult> {
    const response = await api.get('/currency/convert', {
      params: { amount, from, to },
    });
    return response.data;
  }

  async getExchangeRates(base: string): Promise<Record<string, number>> {
    const response = await api.get(`/currency/rates/${base}`);
    return response.data;
  }

  async getCurrencyInfo(code: string): Promise<Currency> {
    const response = await api.get(`/currency/info/${code}`);
    return response.data;
  }

  async getAllCurrencies(): Promise<Currency[]> {
    const response = await api.get('/currency/list');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.currencies)) return data.currencies;
    return [];
  }

  private normalizePricing(raw: Record<string, unknown>, currency: string): RegionalPricing {
    const fallback = (raw.fallback as RegionalPricing | undefined)?.plans;
    const plans = (raw.plans || fallback) as RegionalPricing['plans'];
    const defaultFeatures = {
      starter: ['1 site web', '10 produits', '100 commandes/mois', 'Support email'],
      pro: ['3 sites web', '100 produits', 'Commandes illimitees', 'Support prioritaire', 'Analytics avances'],
      business: ['10 sites web', 'Produits illimites', 'Multi-utilisateurs', 'Support 24/7', 'API access'],
    };

    return {
      currency: String(raw.currency || currency).toUpperCase(),
      region: String(raw.region || 'Regional'),
      plans: {
        starter: {
          monthly: plans?.starter?.monthly ?? 0,
          yearly: plans?.starter?.yearly ?? 0,
          features: plans?.starter?.features ?? defaultFeatures.starter,
        },
        pro: {
          monthly: plans?.pro?.monthly ?? 0,
          yearly: plans?.pro?.yearly ?? 0,
          features: plans?.pro?.features ?? defaultFeatures.pro,
        },
        business: {
          monthly: plans?.business?.monthly ?? 0,
          yearly: plans?.business?.yearly ?? 0,
          features: plans?.business?.features ?? defaultFeatures.business,
        },
      },
    };
  }

  async getPricingByCurrency(currency: string): Promise<RegionalPricing> {
    const response = await api.get(`/currency/pricing/${currency}`);
    return this.normalizePricing(response.data, currency);
  }

  async getPricingByCountry(country: string): Promise<RegionalPricing> {
    const response = await api.get(`/currency/pricing-by-country/${country}`);
    return this.normalizePricing(response.data, country);
  }

  async validateAmount(amount: number, currency: string): Promise<{ valid: boolean; message?: string }> {
    const response = await api.get('/currency/validate', {
      params: { amount, currency },
    });
    return response.data;
  }

  formatCurrency(amount: number, currency: string, decimals: number = 2): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }
}

export const currencyService = new CurrencyService();
