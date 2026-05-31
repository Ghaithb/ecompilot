export type HealthTrend = 'up' | 'down' | 'stable';

export type HealthScore = {
  score: number;
  label: string;
  explanation: string;
  trend: HealthTrend;
  primaryIssue: string;
};

export type BusinessStatus = {
  tone: 'critical' | 'warning' | 'healthy' | 'growth';
  message: string;
  detail?: string;
};

export type TodayFocusItem = {
  id: string;
  type: 'cart' | 'delivery' | 'cod' | 'delay';
  title: string;
  subtitle: string;
  moneyImpact: number;
  count: number;
  href: string;
  priority: 'critical' | 'high' | 'medium';
  urgencyLevel: 'critical' | 'high' | 'medium';
  suggestedAction: string;
};

export type MoneyLanguage = {
  abandonedCartValue: number;
  recoveredRevenue: number;
  deliveryLosses: number;
  conversionGains: number;
  conversionGainPotential: number;
  codAtRisk: number;
  totalAtRisk: number;
};

export type MoneyLeakageItem = {
  id: string;
  label: string;
  lostTND: number;
  recoverableTND: number;
  severity: 'critical' | 'warning' | 'info' | 'positive';
};

export type BusinessNarrative = {
  headline: string;
  summary?: string;
  happened: string[];
  improved: string[];
  decreased: string[];
  recommended: string[];
};

export type RevenueAtRisk = {
  total: number;
  headline: string;
  breakdown: Array<{ label: string; amount: number }>;
};

export type QuickAction = {
  label: string;
  href: string;
  impact?: string;
};

export type RecoveryPerformance = {
  recoveryRate: number;
  recoveredRevenue: number;
  recoveriesSent: number;
  recoveredCount: number;
  bestChannel: string | null;
  insight: string;
};

export type RevenueOpsDashboardData = {
  updatedAt?: string;
  businessStatus: BusinessStatus;
  zeroNoise: boolean;
  growthOpportunities: string[];
  revenueAtRisk: RevenueAtRisk;
  quickActions: QuickAction[];
  recoveryPerformance: RecoveryPerformance;
  kpis: {
    recoveredRevenue: number;
    conversionRate: number;
    abandonedCartRate: number;
    deliverySuccessRate: number;
    codConfirmationRate: number;
    ordersToday: number;
    moneyAtRisk: number;
  };
  money: MoneyLanguage;
  healthScores: {
    overall: number;
    revenueHealth: number;
    revenueHealthLabel: string;
    store: HealthScore;
    delivery: HealthScore;
    recovery: HealthScore;
  };
  narrative: BusinessNarrative;
  todayFocus: TodayFocusItem[];
  moneyLeakage: MoneyLeakageItem[];
  trends: {
    orders: Array<{ date: string; value: number }>;
    recovered: Array<{ date: string; value: number }>;
    conversion: Array<{ date: string; value: number }>;
  };
  insights: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'positive' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
  }>;
  funnel: Array<{
    key: string;
    label: string;
    count: number;
    loss?: number;
    dropRate?: number;
    moneyLost?: number;
    isFrictionPoint?: boolean;
    recoveryRate?: number;
    recoveredRevenue?: number;
    moneyAtRisk?: number;
  }>;
  delivery: {
    successRate: number;
    deliveredCount: number;
    failedDeliveries: number;
    delayedShipments: number;
    avgDeliveryDays: number;
    estimatedImpact: number;
    successTrend: HealthTrend;
    delayedRegions: string[];
    insights: string[];
    bestCarrier: { provider: string; successRate: number; avgDays: number } | null;
    worstCarrier?: { provider: string; successRate: number; failed: number } | null;
  };
  channels: {
    email: { sent: number };
    whatsapp: { sent: number };
    sms: { sent: number };
    best: { id: string; label: string; sent: number } | null;
  };
  actions: {
    cartsToRecover: Array<{
      id: string;
      customerName: string;
      total: number;
      urgencyLevel: string;
      conversionScore?: number;
    }>;
    codToConfirm: Array<{
      id: string;
      orderNumber: string;
      total: number;
      createdAt: string;
    }>;
    failedDeliveries: Array<{
      id: string;
      trackingNumber: string;
      provider: string;
      orderNumber?: string;
      status: string;
    }>;
  };
  recommendations: Array<{
    id: string;
    title: string;
    detail: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  topConvertingProducts: Array<{ title: string; orders: number; revenue: number }>;
};
