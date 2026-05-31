import { api } from '@/lib/api';

export type BillingPlan = {
  id: string;
  name: string;
  priceTnd: number;
  maxOrdersPerMonth: number;
  maxCarriers: number;
  maxUsers: number;
  features: string[];
  customPricing?: boolean;
};

export type BillingSubscription = {
  planId: string;
  plan: BillingPlan;
  usage: {
    ordersThisMonth: number;
    ordersLimit: number;
    ordersRemaining: number;
    withinQuota: boolean;
  };
  paymentMethods: {
    konnect: boolean;
    flouci: boolean;
    cod: boolean;
  };
};

export const billingApi = {
  getPlans: async () => {
    const { data } = await api.get<BillingPlan[]>('/billing/plans');
    return data;
  },
  getSubscription: async () => {
    const { data } = await api.get<BillingSubscription>('/billing/subscription');
    return data;
  },
  changePlan: async (planId: string) => {
    const { data } = await api.patch('/billing/plan', { planId });
    return data;
  },
};
