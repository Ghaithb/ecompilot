import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api';
import { fetchDeliveryOverview } from '@/modules/delivery/services/deliveryApi';
import { SAAS_TAGLINE, SAAS_USE_CASE } from '@/content/saas-launch';
import { ActivationChecklist } from '@/components/onboarding/ActivationChecklist';
import {
  Package,
  ShoppingBag,
  Truck,
  ArrowRight,
  Plug,
  Plus,
} from 'lucide-react';

/** Dashboard SaaS — commandes + livraison uniquement. */
const MvpDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });

  const { data: delivery } = useQuery({
    queryKey: ['delivery-overview'],
    queryFn: fetchDeliveryOverview,
  });

  const toShip = orders.filter((o: { status: string; trackingNumber?: string }) =>
    !o.trackingNumber &&
    ['pending', 'created', 'confirmed', 'prepared'].includes(o.status),
  ).length;

  const connectedCarriers =
    delivery?.providers?.filter((p: { configured: boolean }) => p.configured).length ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
            {SAAS_TAGLINE}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bonjour {user?.firstName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-lg">{SAAS_USE_CASE}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/delivery/connect">
              <Plug className="h-4 w-4 mr-2" />
              Transporteur
            </Link>
          </Button>
          <Button asChild>
            <Link to="/orders">
              <Plus className="h-4 w-4 mr-2" />
              Commandes
            </Link>
          </Button>
        </div>
      </div>

      <ActivationChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              À expédier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums text-amber-600">{toShip}</p>
            <p className="text-xs text-muted-foreground mt-1">commandes sans colis</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Colis actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {delivery?.stats?.inTransit ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">en transit</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Taux livré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums text-emerald-600">
              {delivery?.stats?.successRate ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {delivery?.stats?.delivered ?? 0} livrées
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Transporteurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{connectedCarriers}</p>
            <p className="text-xs text-muted-foreground mt-1">connectés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/orders"
          className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
        >
          <ShoppingBag className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">Commandes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} au total — valider, préparer, expédier
          </p>
          <span className="inline-flex items-center text-sm text-primary mt-4 group-hover:underline">
            Ouvrir <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/delivery"
          className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
        >
          <Truck className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-semibold">Livraison</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {delivery?.stats?.total ?? 0} expéditions — suivi & annulation
          </p>
          <span className="inline-flex items-center text-sm text-primary mt-4 group-hover:underline">
            Ouvrir <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </Link>
      </div>

      {toShip > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-amber-700" />
              <p className="text-sm font-medium">
                {toShip} commande{toShip > 1 ? 's' : ''} en attente d&apos;expédition
              </p>
            </div>
            <Button size="sm" asChild>
              <Link to="/orders">Expédier maintenant</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MvpDashboardPage;
