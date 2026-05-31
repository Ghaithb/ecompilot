import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  if (!data) return null;

  const stats = [
    {
      label: t('dashboard.cod.orders'),
      value: data.totalCodOrders,
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: t('dashboard.cod.itemsDelivered'),
      value: data.totalItems,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: t('dashboard.cod.deliveriesSuccess'),
      value: data.delivered,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: t('dashboard.cod.notDelivered'),
      value: data.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const pipelineRows = [
    { label: t('dashboard.cod.pendingOtp'), value: data.pendingVerification, total: data.totalCodOrders, color: 'bg-amber-500' },
    { label: t('dashboard.cod.confirmed'), value: data.confirmed, total: data.totalCodOrders, color: 'bg-blue-500' },
    { label: t('dashboard.cod.shipped'), value: data.shipped, total: data.totalCodOrders, color: 'bg-indigo-500' },
    { label: t('dashboard.cod.deliveredSuccess'), value: data.delivered, total: data.totalCodOrders, color: 'bg-green-500' },
    { label: t('dashboard.cod.cancelledFailed'), value: data.cancelled, total: data.totalCodOrders, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            {t('dashboard.cod.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard.cod.subtitle')}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {t('dashboard.cod.successRate', { rate: data.deliverySuccessRate.toFixed(0) })}
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
            <CardTitle className="text-base">{t('dashboard.cod.pipelineTitle')}</CardTitle>
            <CardDescription>{t('dashboard.cod.pipelineDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineRows.map((row) => (
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
            <CardTitle className="text-base">{t('dashboard.cod.indicatorsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  {t('dashboard.cod.otpVerification')}
                </span>
                <span className="text-sm font-bold">{data.otpVerificationRate.toFixed(0)}%</span>
              </div>
              <Progress value={data.otpVerificationRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.cod.verifiedOrders', { count: data.verifiedOrders })}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {t('dashboard.cod.deliveryRate')}
                </span>
                <span className="text-sm font-bold">{data.deliverySuccessRate.toFixed(0)}%</span>
              </div>
              <Progress value={data.deliverySuccessRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {t('dashboard.cod.failureRate', { rate: data.deliveryFailureRate.toFixed(0) })}
              </p>
            </div>

            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Banknote className="w-4 h-4" />
                  {t('dashboard.cod.revenueCollected')}
                </span>
                <span className="font-semibold text-green-700">{formatCurrency(data.codRevenueCollected)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {t('dashboard.cod.revenuePending')}
                </span>
                <span className="font-semibold text-amber-700">{formatCurrency(data.codRevenuePending)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('dashboard.cod.itemsPerOrder')}</span>
                <span className="font-semibold">{data.averageItemsPerOrder.toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
