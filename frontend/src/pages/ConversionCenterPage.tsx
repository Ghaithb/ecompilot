import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { abandonedCartApi } from '@/lib/abandonedCartApi';
import { MessageCircle, ShoppingCart, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionCenterData {
  total: number;
  recovered: number;
  pending: number;
  pendingRelance: number;
  recoveryRate: string | number;
  revenueLost: number;
  revenueRecovered: number;
  cartsToRelance: number;
  recoverableRevenue: number;
  recommendations: string[];
  recentAbandoned: Array<{
    _id: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount: number;
    items: Array<{ productName: string; quantity: number }>;
    remindersSent: number;
  }>;
}

export default function ConversionCenterPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<ConversionCenterData>({
    queryKey: ['conversion-center'],
    queryFn: async () => {
      const res = await api.get('/abandoned-cart/conversion-center');
      return res.data;
    },
  });

  const relanceMutation = useMutation({
    mutationFn: (id: string) => abandonedCartApi.startRecoverySequence(id),
    onSuccess: () => {
      toast.success('Relance lancée');
      queryClient.invalidateQueries({ queryKey: ['conversion-center'] });
    },
    onError: () => toast.error('Erreur relance'),
  });

  if (isLoading) {
    return <div className="p-6">Chargement du centre conversion...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Centre Conversion</h1>
          <p className="text-gray-500">Actions pour récupérer plus de commandes</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}><RefreshCw className="w-4 h-4 mr-2" />Actualiser</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-500">Paniers abandonnés</div><div className="text-2xl font-bold">{data?.pending ?? 0}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-500">À relancer</div><div className="text-2xl font-bold text-orange-600">{data?.cartsToRelance ?? 0}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-500">Revenus récupérables</div><div className="text-2xl font-bold text-green-600">{(data?.recoverableRevenue ?? 0).toFixed(0)} DT</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-500">Taux récupération</div><div className="text-2xl font-bold">{data?.recoveryRate ?? 0}%</div></CardContent></Card>
      </div>

      {data?.recommendations?.length ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Zap className="w-5 h-5" />À faire maintenant</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.recommendations.map((tip, i) => (
              <p key={i} className="text-sm">• {tip}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Paniers à récupérer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(data?.recentAbandoned ?? []).length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun panier abandonné pour le moment.</p>
          ) : (
            data?.recentAbandoned.map((cart) => (
              <div key={cart._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-xl">
                <div>
                  <div className="font-semibold">{cart.customerName || cart.customerPhone || 'Visiteur'}</div>
                  <div className="text-sm text-gray-500">{cart.items?.map(i => i.productName).join(', ')}</div>
                  <div className="text-primary font-bold">{cart.totalAmount} DT</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{cart.remindersSent} relance(s)</Badge>
                  <Button size="sm" onClick={() => relanceMutation.mutate(cart._id)}>
                    <MessageCircle className="w-4 h-4 mr-1" />Relancer
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/discounts"><Card className="hover:shadow-md transition cursor-pointer"><CardContent className="pt-6 text-center"><TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" /><div className="font-semibold">Coupons</div></CardContent></Card></Link>
        <Link to="/whatsapp-settings"><Card className="hover:shadow-md transition cursor-pointer"><CardContent className="pt-6 text-center"><MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-600" /><div className="font-semibold">WhatsApp</div></CardContent></Card></Link>
        <Link to="/website"><Card className="hover:shadow-md transition cursor-pointer"><CardContent className="pt-6 text-center"><Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" /><div className="font-semibold">Ma boutique</div></CardContent></Card></Link>
      </div>
    </div>
  );
}
