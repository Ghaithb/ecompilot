import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Truck, Package, CheckCircle2, XCircle, Clock, ShieldCheck, Banknote } from 'lucide-react';

interface CodDeliveryMetrics {
  totalCodOrders: number;
  totalItems: number;
  verifiedOrders: number;
  pendingVerification: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  inProgress: number;
  deliverySuccessRate: number;
  deliveryFailureRate: number;
  codRevenue: number;
  codRevenueCollected: number;
  codRevenuePending: number;
  averageItemsPerOrder: number;
  otpVerificationRate: number;
}

interface CodDeliveryPanelProps {
  data?: CodDeliveryMetrics;
  formatCurrency: (amount: number) => string;
}

export function CodDeliveryPanel({ data, formatCurrency }: CodDeliveryPanelProps) {
  if (!data) return null;

  const stats = [
    {
      label: 'Commandes COD',
      value: data.totalCodOrders,
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Articles livrés',
      value: data.totalItems,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Livraisons réussies',
      value: data.delivered,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Non livrées / annulées',
      value: data.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Paiement à la livraison (COD)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi complet des livraisons, articles et encaissements — 30 derniers jours
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {data.deliverySuccessRate.toFixed(0)}% taux de succès
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pipeline livraison COD</CardTitle>
            <CardDescription>État de chaque commande paiement à la livraison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'En attente OTP', value: data.pendingVerification, total: data.totalCodOrders, color: 'bg-amber-500' },
              { label: 'Confirmées', value: data.confirmed, total: data.totalCodOrders, color: 'bg-blue-500' },
              { label: 'Expédiées', value: data.shipped, total: data.totalCodOrders, color: 'bg-indigo-500' },
              { label: 'Livrées (succès)', value: data.delivered, total: data.totalCodOrders, color: 'bg-green-500' },
              { label: 'Annulées / échec', value: data.cancelled, total: data.totalCodOrders, color: 'bg-red-500' },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{row.label}</span>
                  <span className="font-medium">
                    {row.value}
                    {row.total > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({((row.value / row.total) * 100).toFixed(0)}%)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all`}
                    style={{ width: row.total > 0 ? `${(row.value / row.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Indicateurs COD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Vérification OTP
                </span>
                <span className="text-sm font-bold">{data.otpVerificationRate.toFixed(0)}%</span>
              </div>
              <Progress value={data.otpVerificationRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{data.verifiedOrders} commandes vérifiées</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Taux livraison
                </span>
                <span className="text-sm font-bold">{data.deliverySuccessRate.toFixed(0)}%</span>
              </div>
              <Progress value={data.deliverySuccessRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {data.deliveryFailureRate.toFixed(0)}% d&apos;échecs / annulations
              </p>
            </div>

            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Banknote className="w-4 h-4" />
                  CA encaissé
                </span>
                <span className="font-semibold text-green-700">{formatCurrency(data.codRevenueCollected)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  CA en attente
                </span>
                <span className="font-semibold text-amber-700">{formatCurrency(data.codRevenuePending)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Articles / commande</span>
                <span className="font-semibold">{data.averageItemsPerOrder.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
