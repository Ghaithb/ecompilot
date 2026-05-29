import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async convert(amount: number, from: string, to: string): Promise<ConversionResult> {
    const response = await axios.get(`${API_URL}/currency/convert`, {
      params: { amount, from, to },
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getExchangeRates(base: string): Promise<Record<string, number>> {
    const response = await axios.get(`${API_URL}/currency/rates/${base}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getCurrencyInfo(code: string): Promise<Currency> {
    const response = await axios.get(`${API_URL}/currency/info/${code}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getAllCurrencies(): Promise<Currency[]> {
    const response = await axios.get(`${API_URL}/currency/list`, {
      headers: this.getHeaders(),
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.currencies)) return data.currencies;
    return [];
  }

  async getPricingByCurrency(currency: string): Promise<RegionalPricing> {
    const response = await axios.get(`${API_URL}/currency/pricing/${currency}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getPricingByCountry(country: string): Promise<RegionalPricing> {
    const response = await axios.get(`${API_URL}/currency/pricing-by-country/${country}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async validateAmount(amount: number, currency: string): Promise<{ valid: boolean; message?: string }> {
    const response = await axios.get(`${API_URL}/currency/validate`, {
      params: { amount, currency },
      headers: this.getHeaders(),
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
