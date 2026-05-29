import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AFRICAN_CURRENCIES } from '../../config/currencies.config';

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

interface CachedRate {
  rate: number;
  timestamp: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cacheRates = new Map<string, CachedRate>();
  private readonly CACHE_DURATION = 3600000; // 1 heure
  private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest';

  /** Unités de devise pour 1 EUR (utilisé si l'API externe est indisponible) */
  private readonly EUR_REFERENCE: Record<string, number> = {
    EUR: 1,
    TND: 3.35,
    USD: 1.08,
    GBP: 0.86,
    MAD: 10.8,
    XOF: 655.957,
    XAF: 655.957,
    DZD: 145,
    EGP: 52,
    NGN: 1750,
    GHS: 16,
    KES: 140,
    ZAR: 20,
  };

  // Taux fixes (CFA) — 1 EUR = X
  private readonly FIXED_RATES = {
    XOF: 655.957,
    XAF: 655.957,
    MAD: 10.8,
    TND: 3.35,
  };

  /**
   * Convertit un montant d'une devise à une autre
   */
  async convert(amount: number, from: string, to: string): Promise<number> {
    // Même devise = pas de conversion
    if (from === to) {
      return amount;
    }

    // Utiliser les taux fixes si disponibles
    if (from === 'EUR' && this.FIXED_RATES[to]) {
      return this.roundToDecimals(amount * this.FIXED_RATES[to], to);
    }

    if (to === 'EUR' && this.FIXED_RATES[from]) {
      return this.roundToDecimals(amount / this.FIXED_RATES[from], to);
    }

    // Conversion entre deux devises CFA (même taux)
    if (this.FIXED_RATES[from] && this.FIXED_RATES[to]) {
      return this.roundToDecimals(amount, to); // 1:1
    }

    const fallbackRate = this.getFallbackRate(from, to);
    if (fallbackRate !== null) {
      return this.roundToDecimals(amount * fallbackRate, to);
    }

    const rate = await this.getExchangeRate(from, to);
    return this.roundToDecimals(amount * rate, to);
  }

  /** Taux 1 `from` = X `to` sans appel réseau */
  private getFallbackRate(from: string, to: string): number | null {
    const fromPerEur = this.EUR_REFERENCE[from];
    const toPerEur = this.EUR_REFERENCE[to];
    if (!fromPerEur || !toPerEur) return null;
    return toPerEur / fromPerEur;
  }

  private buildFallbackRates(baseCurrency: string): Record<string, number> {
    const basePerEur = this.EUR_REFERENCE[baseCurrency];
    if (!basePerEur) {
      return { [baseCurrency]: 1 };
    }
    const rates: Record<string, number> = {};
    for (const [code, perEur] of Object.entries(this.EUR_REFERENCE)) {
      rates[code] = perEur / basePerEur;
    }
    return rates;
  }

  /**
   * Récupère le taux de change (avec cache)
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    const staticRate = this.getFallbackRate(from, to);
    if (staticRate !== null) {
      return staticRate;
    }

    const cacheKey = `${from}_${to}`;
    const cached = this.cacheRates.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      this.logger.debug(`Using cached rate for ${cacheKey}: ${cached.rate}`);
      return cached.rate;
    }

    try {
      this.logger.log(`Fetching exchange rate for ${from} -> ${to}`);
      const response = await axios.get<ExchangeRateResponse>(`${this.API_URL}/${from}`);
      
      const rate = response.data.rates[to];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${to}`);
      }

      // Mettre en cache
      this.cacheRates.set(cacheKey, {
        rate,
        timestamp: Date.now(),
      });

      this.logger.debug(`Fetched and cached rate for ${cacheKey}: ${rate}`);
      return rate;
    } catch (error) {
      this.logger.error(`Error fetching exchange rate: ${error.message}`);
      
      // Fallback: utiliser un taux approximatif si disponible
      if (cached) {
        this.logger.warn(`Using stale cached rate for ${cacheKey}`);
        return cached.rate;
      }

      const fallback = this.getFallbackRate(from, to);
      if (fallback !== null) {
        this.logger.warn(`Using static fallback rate for ${from} -> ${to}`);
        return fallback;
      }

      throw new Error(`Could not fetch exchange rate for ${from} -> ${to}`);
    }
  }

  /**
   * Arrondit selon le nombre de décimales de la devise
   */
  private roundToDecimals(amount: number, currencyCode: string): number {
    const currency = AFRICAN_CURRENCIES[currencyCode];
    if (!currency) return Math.round(amount * 100) / 100;

    const factor = Math.pow(10, currency.decimals);
    return Math.round(amount * factor) / factor;
  }

  /**
   * Obtient tous les taux pour une devise de base
   */
  async getAllRates(baseCurrency: string): Promise<Record<string, number>> {
    const fallback = this.buildFallbackRates(baseCurrency);
    try {
      const response = await axios.get<ExchangeRateResponse>(
        `${this.API_URL}/${baseCurrency}`,
        { timeout: 8000 },
      );
      return { ...fallback, ...response.data.rates };
    } catch (error) {
      this.logger.warn(
        `API rates unavailable for ${baseCurrency}, using static fallback: ${error.message}`,
      );
      return fallback;
    }
  }

  /**
   * Formate un montant avec le symbole de la devise
   */
  formatAmount(amount: number, currencyCode: string): string {
    const currency = AFRICAN_CURRENCIES[currencyCode];
    if (!currency) {
      return `${amount.toFixed(2)}`;
    }

    const formatted = amount.toLocaleString('fr-FR', {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    });

    return `${formatted} ${currency.symbol}`;
  }

  /**
   * Valide un montant selon les règles de la devise
   */
  validateAmount(amount: number, currencyCode: string): boolean {
    const currency = AFRICAN_CURRENCIES[currencyCode];
    if (!currency) return true;

    return amount >= currency.minAmount;
  }

  /**
   * Obtient le montant minimum pour une devise
   */
  getMinAmount(currencyCode: string): number {
    const currency = AFRICAN_CURRENCIES[currencyCode];
    return currency?.minAmount || 1;
  }

  /**
   * Nettoie le cache (utile pour les tests)
   */
  clearCache(): void {
    this.cacheRates.clear();
    this.logger.log('Currency cache cleared');
  }

  /**
   * Obtient les informations d'une devise
   */
  getCurrencyInfo(currencyCode: string) {
    return AFRICAN_CURRENCIES[currencyCode];
  }

  /**
   * Liste toutes les devises disponibles
   */
  getAllCurrencies() {
    return Object.values(AFRICAN_CURRENCIES);
  }
}
