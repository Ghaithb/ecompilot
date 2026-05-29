import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { abandonedCartApi, type AbandonedCart } from '@/lib/abandonedCartApi';
import {
  ShoppingCart,
  Mail,
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  Eye,
  CheckCircle,
  Loader2,
  Phone,
  MessageSquare,
} from 'lucide-react';

const AbandonedCartPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartsData, isLoading: loadingCarts } = useQuery({
    queryKey: ['abandoned-carts'],
    queryFn: () => abandonedCartApi.getAll({ limit: 20 }),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['abandoned-carts-stats'],
    queryFn: abandonedCartApi.getStats,
  });

  const sendReminderMutation = useMutation({
    mutationFn: (cartId: string) => abandonedCartApi.sendReminder(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] });
      toast({ title: 'Rappel envoyé', description: 'Le client a été relancé avec succès' });
    },
    onError: () => {
      toast({ title: 'Erreur', description: 'Impossible d envoyer le rappel', variant: 'destructive' });
    },
  });

  const abandonedCarts = cartsData?.carts || [];

  const getStatusBadge = (cart: AbandonedCart) => {
    if (cart.recovered) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3" /> Récupéré</Badge>;
    }
    if (cart.remindersSent > 0) {
      return <Badge variant="secondary"><Mail className="w-3 h-3" /> {cart.remindersSent} relance(s)</Badge>;
    }
    return <Badge variant="outline"><Clock className="w-3 h-3" /> En attente</Badge>;
  };

  if (loadingCarts || loadingStats) {
    return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" /> Paniers abandonnés
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats?.totalAbandoned || 0}</p></div><ShoppingCart className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Valeur</p><p className="text-2xl font-bold">{stats?.totalValue?.toFixed(2) || '0.00'}€</p></div><DollarSign className="w-8 h-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Taux</p><p className="text-2xl font-bold">{stats?.recoveryRate?.toFixed(1) || '0.0'}%</p></div><TrendingUp className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Récupérés</p><p className="text-2xl font-bold">{stats?.recoveredValue?.toFixed(2) || '0.00'}€</p></div><CheckCircle className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des paniers</CardTitle></CardHeader>
        <CardContent>
          {abandonedCarts.length === 0 ? (
            <div className="text-center py-12"><p>Aucun panier abandonné</p></div>
          ) : (
            <div className="space-y-4">
              {abandonedCarts.map((cart) => (
                <div key={cart._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div><h3 className="font-semibold">{cart.customerName || 'Client'}</h3><p className="text-sm">{cart.customerEmail}</p></div>
                    {getStatusBadge(cart)}
                    <div className="flex items-center gap-6 text-sm"><span>{cart.totalAmount.toFixed(2)}€ ({cart.items.length} articles)</span><Clock className="w-4 h-4" />{new Date(cart.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!cart.recovered && (
                      <Button size="sm" onClick={() => sendReminderMutation.mutate(cart._id)} disabled={sendReminderMutation.isPending}><Send className="w-4 h-4" /> Relancer</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AbandonedCartPage;
