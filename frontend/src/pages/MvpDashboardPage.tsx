import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/analyticsApi';
import { RevenueOpsDashboard } from '@/components/RevenueOps/RevenueOpsDashboard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import type { RevenueOpsDashboardData } from '@/components/RevenueOps/types';

function normalizeDashboardData(raw: RevenueOpsDashboardData): RevenueOpsDashboardData {
  return {
    ...raw,
    revenueAtRisk: {
      total: raw.revenueAtRisk?.total ?? 0,
      headline: raw.revenueAtRisk?.headline ?? '',
      breakdown: raw.revenueAtRisk?.breakdown ?? [],
    },
    todayFocus: raw.todayFocus ?? [],
    growthOpportunities: raw.growthOpportunities ?? [],
    moneyLeakage: raw.moneyLeakage ?? [],
    quickActions: raw.quickActions ?? [],
    funnel: raw.funnel ?? [],
    narrative: {
      headline: raw.narrative?.headline ?? '',
      summary: raw.narrative?.summary,
      happened: raw.narrative?.happened ?? [],
      improved: raw.narrative?.improved ?? [],
      decreased: raw.narrative?.decreased ?? [],
      recommended: raw.narrative?.recommended ?? [],
    },
    trends: {
      orders: raw.trends?.orders ?? [],
      recovered: raw.trends?.recovered ?? [],
      conversion: raw.trends?.conversion ?? [],
    },
    actions: {
      cartsToRecover: raw.actions?.cartsToRecover ?? [],
      codToConfirm: raw.actions?.codToConfirm ?? [],
      failedDeliveries: raw.actions?.failedDeliveries ?? [],
    },
    delivery: raw.delivery ?? {
      successRate: 0,
      deliveredCount: 0,
      failedDeliveries: 0,
      delayedShipments: 0,
      avgDeliveryDays: 0,
      estimatedImpact: 0,
      successTrend: 'stable',
      delayedRegions: [],
      insights: [],
      bestCarrier: null,
    },
    recoveryPerformance: raw.recoveryPerformance ?? {
      recoveryRate: 0,
      recoveredRevenue: 0,
      recoveriesSent: 0,
      recoveredCount: 0,
      bestChannel: null,
      insight: '',
    },
  };
}

/** Merchant Command Center — real-time business health & actions */
const MvpDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['merchant-command-center'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t('dashboard.loading')}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-4">
        <p className="text-base font-medium text-foreground">{t('dashboard.error')}</p>
        <p className="text-sm text-muted-foreground">{t('dashboard.errorHint')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Réessayer
          </Button>
          <Button asChild variant="default">
            <Link to="/delivery/connect">Connecter livraison</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RevenueOpsDashboard
      data={normalizeDashboardData(data)}
      userName={user?.firstName}
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    />
  );
};

export default MvpDashboardPage;
