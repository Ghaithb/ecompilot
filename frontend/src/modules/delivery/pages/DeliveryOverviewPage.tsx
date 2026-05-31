import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Plug, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryStatCard } from '../components/DeliveryStatCard';
import { DeliveryPageShell } from '../components/DeliveryPageShell';
import { CreateShipmentDialog } from '../components/CreateShipmentDialog';
import { CarrierManifestPanel } from '../components/CarrierManifestPanel';
import { fetchDeliveryOverview, PROVIDER_LABELS } from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';

const DeliveryOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-overview'],
    queryFn: fetchDeliveryOverview,
  });

  const stats = data?.stats;
  const providers = data?.providers || [];
  const connected = providers.filter((p) => p.configured).length;

  return (
    <DeliveryPageShell
      title={t('delivery.overviewTitle')}
      description={t('delivery.overviewDesc')}
      actions={<CreateShipmentDialog />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <DeliveryStatCard
          title={t('delivery.statShipments')}
          value={isLoading ? '…' : stats?.total ?? 0}
        />
        <DeliveryStatCard
          title={t('delivery.statDelivered')}
          value={isLoading ? '…' : stats?.delivered ?? 0}
          hint={t('delivery.statSuccessRate', { rate: stats?.successRate ?? 0 })}
        />
        <DeliveryStatCard
          title={t('delivery.statInTransit')}
          value={isLoading ? '…' : stats?.inTransit ?? 0}
        />
        <DeliveryStatCard
          title={t('delivery.statRefused')}
          value={isLoading ? '…' : stats?.refused ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2 border-border/60 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-indigo-400" />
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">{t('delivery.carriersTitle')}</h2>
            <div className="space-y-3">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3 border-b border-border/60 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Truck className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {PROVIDER_LABELS[p.id as DeliveryProviderId] || p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('delivery.priority', { n: p.priority })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      p.configured
                        ? 'text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full'
                        : 'text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full'
                    }
                  >
                    {p.configured ? t('delivery.connected') : t('delivery.toConfigure')}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 px-0" asChild>
              <Link to="/delivery/connect">
                {t('delivery.manageConnections')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">{t('delivery.quickStart')}</h2>
            <p className="text-sm text-muted-foreground">
              {connected === 0
                ? t('delivery.connectAtLeastOne')
                : t('delivery.carriersReady', { count: connected })}
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/delivery/connect">
                <Plug className="h-4 w-4 mr-2" />
                {t('delivery.connectApi')}
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link to="/delivery/shipments">
                <Package className="h-4 w-4 mr-2" />
                {t('delivery.viewShipments')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <CarrierManifestPanel providers={providers.filter((p) => p.configured)} />
    </DeliveryPageShell>
  );
};

export default DeliveryOverviewPage;
