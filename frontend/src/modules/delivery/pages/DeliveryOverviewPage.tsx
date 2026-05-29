import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Plug, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeliveryStatCard } from '../components/DeliveryStatCard';
import { DeliveryPageShell } from '../components/DeliveryPageShell';
import { CreateShipmentDialog } from '../components/CreateShipmentDialog';
import { fetchDeliveryOverview, PROVIDER_LABELS } from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';

const DeliveryOverviewPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-overview'],
    queryFn: fetchDeliveryOverview,
  });

  const stats = data?.stats;
  const providers = data?.providers || [];
  const connected = providers.filter((p) => p.configured).length;

  return (
    <DeliveryPageShell
      title="Vue d'ensemble"
      description="Pilotez vos expéditions multi-transporteurs — INTIGO, First Delivery et Shipper."
      actions={<CreateShipmentDialog />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <DeliveryStatCard
          title="Expéditions"
          value={isLoading ? '…' : stats?.total ?? 0}
        />
        <DeliveryStatCard
          title="Livrées"
          value={isLoading ? '…' : stats?.delivered ?? 0}
          hint={`${stats?.successRate ?? 0}% taux de succès`}
        />
        <DeliveryStatCard
          title="En transit"
          value={isLoading ? '…' : stats?.inTransit ?? 0}
        />
        <DeliveryStatCard
          title="Refus / retours"
          value={isLoading ? '…' : stats?.refused ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="lg:col-span-2 border-border/60 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-indigo-400" />
          <CardContent className="p-6">
            <h2 className="font-semibold text-lg mb-4">Transporteurs</h2>
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
                        Priorité {p.priority}
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
                    {p.configured ? 'Connecté' : 'À configurer'}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="link" className="mt-4 px-0" asChild>
              <Link to="/delivery/connect">
                Gérer les connexions
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Démarrage rapide</h2>
            <p className="text-sm text-muted-foreground">
              {connected === 0
                ? 'Connectez au moins un transporteur pour expédier.'
                : `${connected} transporteur(s) prêt(s).`}
            </p>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/delivery/connect">
                <Plug className="h-4 w-4 mr-2" />
                Connecter API
              </Link>
            </Button>
            <Button className="w-full" asChild>
              <Link to="/delivery/shipments">
                <Package className="h-4 w-4 mr-2" />
                Voir expéditions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DeliveryPageShell>
  );
};

export default DeliveryOverviewPage;
