import { api } from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    maxProducts?: number;
    maxOrders?: number;
    maxUsers?: number;
    maxStorage?: number;
  };
}

export interface Subscription {
  _id: string;
  tenantId: string;
  plan: string;
  status: 'active' | 'trial' | 'cancelled' | 'past_due' | 'unpaid';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialEndsAt?: Date;
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
    maxStorage: number;
  };
  usage: {
    products: number;
    orders: number;
    users: number;
    storage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  resource: 'products' | 'orders' | 'users' | 'storage';
  current: number;
  limit: number;
  percentage: number;
  isOverLimit: boolean;
}

export const billingApi = {
  /**
   * Récupérer les plans d'abonnement disponibles
   */
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Récupérer l'abonnement actuel du tenant
   */
  getCurrentSubscription: async (): Promise<Subscription | null> => {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Créer un nouvel abonnement
   */
  createSubscription: async (planId: string, stripeCustomerId?: string): Promise<Subscription> => {
    const response = await api.post('/subscriptions/create', {
      planId,
      stripeCustomerId,
    });
    return response.data;
  },

  /**
   * Mettre à niveau l'abonnement
   */
  upgradeSubscription: async (newPlanId: string): Promise<Subscription> => {
    const response = await api.post('/subscriptions/upgrade', {
      newPlanId,
    });
    return response.data;
  },

  /**
   * Annuler l'abonnement
   */
  cancelSubscription: async (atPeriodEnd: boolean = true): Promise<Subscription> => {
    const response = await api.post('/subscriptions/cancel', {
      atPeriodEnd,
    });
    return response.data;
  },

  /**
   * Vérifier les limites d'utilisation pour une ressource
   */
  checkUsageLimits: async (
    resource: 'products' | 'orders' | 'users' | 'storage'
  ): Promise<UsageStats> => {
    const response = await api.get(`/subscriptions/usage/${resource}`);
    return response.data;
  },

  /**
   * Créer une session Stripe Checkout
   */
  createCheckoutSession: async (priceId: string, successUrl?: string, cancelUrl?: string) => {
    const response = await api.post('/billing/create-checkout-session', {
      priceId,
      successUrl: successUrl || `${window.location.origin}/billing/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/billing/cancel`,
    });
    return response.data;
  },

  /**
   * Confirmer le paiement réussi
   */
  confirmPaymentSuccess: async (sessionId: string) => {
    const response = await api.post('/billing/payment-success', {
      sessionId,
    });
    return response.data;
  },
};
