import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CheckCircle, Truck, Package, XCircle, CreditCard } from 'lucide-react';

interface OrderFunnel {
  totalOrders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  codOrders: number;
  onlinePaidOrders: number;
  conversionToDelivered: number;
  conversionToConfirmed: number;
}

interface OrderFunnelPanelProps {
  funnel?: OrderFunnel;
}

export function OrderFunnelPanel({ funnel }: OrderFunnelPanelProps) {
  if (!funnel || funnel.totalOrders === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline commandes</CardTitle>
          <CardDescription>Le funnel apparaîtra après vos premières commandes</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const steps = [
    { label: 'Commandes reçues', value: funnel.totalOrders, icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Confirmées', value: funnel.confirmed + funnel.shipped + funnel.delivered, icon: CheckCircle, color: '#10b981' },
    { label: 'Expédiées', value: funnel.shipped + funnel.delivered, icon: Package, color: '#8b5cf6' },
    { label: 'Livrées', value: funnel.delivered, icon: Truck, color: '#059669' },
  ];

  const maxValue = steps[0].value;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pipeline commandes</CardTitle>
            <CardDescription>De la commande à la livraison — 30 derniers jours</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">{funnel.codOrders} COD</Badge>
            <Badge variant="outline">{funnel.onlinePaidOrders} en ligne</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const prev = index > 0 ? steps[index - 1].value : step.value;
            const rate = prev > 0 ? ((step.value / prev) * 100).toFixed(0) : '0';
            const width = maxValue > 0 ? (step.value / maxValue) * 100 : 0;

            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4" style={{ color: step.color }} />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{step.value}</span>
                    {index > 0 && (
                      <span className="text-xs text-green-600">{rate}%</span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${width}%`, backgroundColor: step.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{funnel.conversionToDelivered.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Taux livraison</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{funnel.conversionToConfirmed.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Taux confirmation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{funnel.cancelled}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3" /> Annulées
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{funnel.pending}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
        </div>

        {funnel.onlinePaidOrders > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            {funnel.onlinePaidOrders} commande(s) payées en ligne (hors COD)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
