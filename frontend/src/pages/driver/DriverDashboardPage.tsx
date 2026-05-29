import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeliveryStatusDialog from '@/components/driver/DeliveryStatusDialog';

type Delivery = {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address1?: string;
    province?: string;
  };
};

const DriverDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ deliveriesToday: number; amountToCollect: number } | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [dialog, setDialog] = useState<{
    orderId: string;
    total: number;
    status: 'out_for_delivery' | 'delivered' | 'refused';
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        api.get('/driver/stats'),
        api.get<Delivery[]>('/driver/deliveries', { params: { filter: 'today' } }),
      ]);
      setStats(s.data);
      setDeliveries(Array.isArray(d.data) ? d.data : []);
    } catch {
      toast({
        title: 'Accès livreur requis',
        description: 'Connectez-vous avec un compte livreur.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const quickRoute = async (orderId: string) => {
    try {
      await api.patch(`/driver/deliveries/${orderId}/status`, { status: 'out_for_delivery' });
      load();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-lg mx-auto pb-24">
      <h1 className="text-2xl font-bold mb-4">Livraisons du jour</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Colis</p>
              <p className="text-2xl font-bold">{stats.deliveriesToday}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">À collecter</p>
              <p className="text-2xl font-bold">{stats.amountToCollect} TND</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        {deliveries.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Aucune livraison assignée.</p>
        )}
        {deliveries.map((d) => (
          <Card key={d._id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                #{d.orderNumber}
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {d.status.replace(/_/g, ' ')}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-lg text-primary">
                {d.total} {d.currency || 'TND'}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <a href={`tel:${d.shippingAddress?.phone}`}>{d.shippingAddress?.phone}</a>
              </p>
              <p className="flex items-start gap-1">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                {d.shippingAddress?.address1}, {d.shippingAddress?.province}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => quickRoute(d._id)}>
                  Je suis en route
                </Button>
                <Button
                  size="sm"
                  onClick={() => setDialog({ orderId: d._id, total: d.total, status: 'delivered' })}
                >
                  Livré + photo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialog({ orderId: d._id, total: d.total, status: 'refused' })}
                >
                  Refus client
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dialog && (
        <DeliveryStatusDialog
          open={!!dialog}
          onClose={() => setDialog(null)}
          orderId={dialog.orderId}
          orderTotal={dialog.total}
          status={dialog.status}
          onSuccess={load}
        />
      )}
    </div>
  );
};

export default DriverDashboardPage;
