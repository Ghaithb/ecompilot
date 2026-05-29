import { DeliveryProviderId } from '../enums/delivery-provider.enum';

/** Configuration résolue par boutique (BYO) ou fallback plateforme (.env). */
export interface ResolvedProviderConfig {
  provider: DeliveryProviderId;
  apiUrl: string;
  apiKey: string;
  /** true = pas de clé tenant ni env — simulation contrôlée */
  mock: boolean;
  source: 'tenant' | 'platform' | 'none';
  extra?: Record<string, string>;
}
