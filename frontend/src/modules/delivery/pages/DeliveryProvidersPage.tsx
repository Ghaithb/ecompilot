import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchDeliveryProviders } from '../services/deliveryApi';

const DeliveryProvidersPage: React.FC = () => {
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['delivery-providers'],
    queryFn: fetchDeliveryProviders,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transporteurs</h1>
        <p className="text-muted-foreground">
          Connectez vos clés API dans Paramètres (variables .env ou credentials chiffrés).
        </p>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-muted-foreground">Chargement…</p>}
        {providers.map((p: {
          id: string;
          name: string;
          configured: boolean;
          priority: number;
          supportsPickup?: boolean;
          supportsLocalities?: boolean;
        }) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <Badge variant={p.configured ? 'default' : 'secondary'}>
                  {p.configured ? 'Configuré' : 'Simulation'}
                </Badge>
              </div>
              <CardDescription>Priorité {p.priority}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex gap-3">
              {p.supportsLocalities && <span>Localités</span>}
              {p.supportsPickup && <span>Pickups</span>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeliveryProvidersPage;
