import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, MapPin, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryPageShell } from '../components/DeliveryPageShell';
import { api } from '@/lib/api';
import { PROVIDER_LABELS } from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';

type CarrierAnalytics = {
  delivery: {
    successRate: number;
    deliveredCount: number;
    failedDeliveries: number;
    delayedShipments: number;
    bestCarrier: { provider: string; successRate: number; avgDays: number } | null;
    worstCarrier: { provider: string; successRate: number; failed: number } | null;
    insights: string[];
  };
  regional: Array<{ region: string; orders: number; revenue: number }>;
  periodDays: number;
};

const DeliveryAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'carriers'],
    queryFn: async () => {
      const { data: res } = await api.get<CarrierAnalytics>('/analytics/carriers');
      return res;
    },
  });

  const delivery = data?.delivery;
  const providerLabel = (id: string) =>
    PROVIDER_LABELS[id as DeliveryProviderId] || id;

  return (
    <DeliveryPageShell title={t('deliveryAnalytics.title')} description={t('deliveryAnalytics.desc')}>
      {isLoading && <p className="text-muted-foreground">{t('common.loading')}</p>}

      {delivery && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('deliveryAnalytics.successRate')}</p>
                <p className="text-2xl font-bold">{delivery.successRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('deliveryAnalytics.delivered')}</p>
                <p className="text-2xl font-bold text-green-700">{delivery.deliveredCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('deliveryAnalytics.failed')}</p>
                <p className="text-2xl font-bold text-red-700">{delivery.failedDeliveries}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{t('deliveryAnalytics.delayed')}</p>
                <p className="text-2xl font-bold text-amber-700">{delivery.delayedShipments}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="w-4 h-4" />
                  {t('deliveryAnalytics.bestWorst')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {delivery.bestCarrier && (
                  <p>
                    <span className="font-medium text-green-700">{t('deliveryAnalytics.best')}: </span>
                    {providerLabel(delivery.bestCarrier.provider)} ({delivery.bestCarrier.successRate}% · ~
                    {delivery.bestCarrier.avgDays} j)
                  </p>
                )}
                {delivery.worstCarrier && (
                  <p>
                    <span className="font-medium text-red-700">{t('deliveryAnalytics.watch')}: </span>
                    {providerLabel(delivery.worstCarrier.provider)} ({delivery.worstCarrier.failed}{' '}
                    {t('deliveryAnalytics.failures')})
                  </p>
                )}
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  {delivery.insights.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  {t('deliveryAnalytics.topRegions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(data?.regional || []).slice(0, 6).map((r) => (
                  <div key={r.region} className="flex justify-between py-2 border-b last:border-0 text-sm">
                    <span>{r.region}</span>
                    <span className="text-muted-foreground">
                      {r.orders} {t('deliveryAnalytics.ordersShort')} · {r.revenue.toFixed(0)} TND
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4" />
            {t('deliveryAnalytics.phase2Title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t('deliveryAnalytics.phase2Desc')}
        </CardContent>
      </Card>
    </DeliveryPageShell>
  );
};

export default DeliveryAnalyticsPage;
