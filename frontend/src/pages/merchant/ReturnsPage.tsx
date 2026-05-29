import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw } from 'lucide-react';

type ReturnOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  refusalReason?: string;
  returnReason?: string;
};

const ReturnsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [stats, setStats] = useState<{ returnRatePercent: number; refused: number } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([
        api.get<ReturnOrder[]>('/orders/returns/list'),
        api.get('/orders/returns/stats'),
      ]);
      setOrders(list.data);
      setStats(st.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const completeReturn = async (id: string, decision: 'completed' | 'rejected') => {
    try {
      await api.patch(`/orders/${id}/return/complete`, { decision });
      toast({ title: decision === 'completed' ? 'Retour traité' : 'Retour rejeté' });
      load();
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <RotateCcw className="w-7 h-7" />
        Retours & refus
      </h1>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Taux de refus</p>
              <p className="text-2xl font-bold">{stats.returnRatePercent}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Refus total</p>
              <p className="text-2xl font-bold">{stats.refused}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>À traiter</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="animate-spin w-6 h-6" />
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">Aucun retour en cours.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o._id} className="border rounded-lg p-4">
                  <p className="font-medium">#{o.orderNumber}</p>
                  <p className="text-sm capitalize">{o.status.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    Raison : {o.refusalReason || o.returnReason || '—'}
                  </p>
                  {o.status === 'returned_to_seller' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => completeReturn(o._id, 'completed')}>
                        Retour OK
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => completeReturn(o._id, 'rejected')}
                      >
                        Rejeter
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnsPage;
