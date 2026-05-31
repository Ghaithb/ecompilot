import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { conversionApi } from '@/lib/abandonedCartApi';
import { TrendingUp, ShoppingCart, RotateCcw, Target } from 'lucide-react';

export default function ConversionRevenuePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['conversion-dashboard'],
    queryFn: conversionApi.getDashboard,
  });

  if (isLoading) return <div className="p-6">Chargement metrics conversion…</div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">Revenue Recovery</h1>
        <p className="text-muted-foreground">Optimisation conversion & récupération paniers</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Revenus récupérés
            </div>
            <div className="text-2xl font-bold text-green-600">{data?.revenueRecovered ?? 0} DT</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingCart className="h-4 w-4" /> Paniers abandonnés
            </div>
            <div className="text-2xl font-bold">{data?.abandonedCartsValue ?? 0} DT</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="h-4 w-4" /> Taux récupération
            </div>
            <div className="text-2xl font-bold">{data?.recoveryRate ?? 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" /> Conversion checkout
            </div>
            <div className="text-2xl font-bold">{data?.checkoutConversionRate ?? 0}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Funnel conversion</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Paniers</span><strong>{data?.funnel?.carts ?? 0}</strong></div>
            <div className="flex justify-between"><span>Checkouts</span><strong>{data?.funnel?.checkouts ?? 0}</strong></div>
            <div className="flex justify-between"><span>Commandes</span><strong>{data?.funnel?.orders ?? 0}</strong></div>
            <div className="flex justify-between"><span>Livrées</span><strong>{data?.funnel?.delivered ?? 0}</strong></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Funnel récupération</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Abandons</span><strong>{data?.recoveryFunnel?.abandoned ?? 0}</strong></div>
            <div className="flex justify-between"><span>Relances</span><strong>{data?.recoveryFunnel?.remindersSent ?? 0}</strong></div>
            <div className="flex justify-between"><span>Récupérés</span><strong>{data?.recoveryFunnel?.recovered ?? 0}</strong></div>
          </CardContent>
        </Card>
      </div>

      {data?.channelPerformance && (
        <Card>
          <CardHeader><CardTitle className="text-base">Performance par canal</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border p-3">
              <p className="font-medium">Email</p>
              <p>{data.channelPerformance.email?.sent ?? 0} relances</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">WhatsApp</p>
              <p>{data.channelPerformance.whatsapp?.sent ?? 0} relances</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">SMS</p>
              <p>{data.channelPerformance.sms?.sent ?? 0} relances</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.topRecoveringProducts?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Top produits récupérables</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.topRecoveringProducts.map((p: { title: string; value: number; count: number }) => (
              <div key={p.title} className="flex justify-between text-sm">
                <span>{p.title} (×{p.count})</span>
                <span className="font-medium">{p.value.toFixed(0)} DT</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">A/B Checkout (MVP)</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border p-3">
            <p className="font-medium">Variante A</p>
            <p>Conversion: {data?.experiments?.checkoutA?.conversionRate ?? 0}%</p>
            <p className="text-muted-foreground">{data?.experiments?.checkoutA?.completed ?? 0}/{data?.experiments?.checkoutA?.started ?? 0} complétés</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="font-medium">Variante B</p>
            <p>Conversion: {data?.experiments?.checkoutB?.conversionRate ?? 0}%</p>
            <p className="text-muted-foreground">{data?.experiments?.checkoutB?.completed ?? 0}/{data?.experiments?.checkoutB?.started ?? 0} complétés</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
