import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDeliveryOverview, fetchDeliveryProviders } from '../services/deliveryApi';
import { DeliveryStatCard } from '../components/DeliveryStatCard';

const DeliveryAnalyticsPage: React.FC = () => {
  const { data: overview } = useQuery({
    queryKey: ['delivery-overview'],
    queryFn: fetchDeliveryOverview,
  });
  const { data: providers = [] } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Analytics livraison</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <DeliveryStatCard
          title="Taux de succès"
          value={`${overview?.stats?.successRate ?? 0}%`}
        />
        <DeliveryStatCard title="Total colis" value={overview?.stats?.total ?? 0} />
        <DeliveryStatCard title="En transit" value={overview?.stats?.inTransit ?? 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparaison transporteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {providers.map((p: { id: string; name: string; configured: boolean }) => (
              <li key={p.id} className="flex justify-between text-sm border-b py-2">
                <span>{p.name}</span>
                <span className="text-muted-foreground">
                  {p.configured ? 'Production' : 'Mode test'}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Analytics régionales & performance détaillée — phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryAnalyticsPage;
