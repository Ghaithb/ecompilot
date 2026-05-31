import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Package,
  RefreshCw,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RevenueOpsDashboardData } from '@/components/RevenueOps/types';

type Props = {
  data?: RevenueOpsDashboardData;
  formatPrice: (n: number) => string;
  loading?: boolean;
};

export function RevenueCommandCenter({ data, formatPrice, loading }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="saas-card h-32 skeleton" />
        ))}
      </div>
    );
  }

  const kpis = data?.kpis;
  const recovery = data?.recoveryPerformance;
  const delivery = data?.delivery;

  const cards = [
    {
      label: t('dashboard.command.revenueToday'),
      value: String(kpis?.ordersToday ?? 0),
      hint: t('dashboard.command.revenueTodayHint'),
      icon: DollarSign,
      tone: 'primary' as const,
      href: '/analytics',
    },
    {
      label: t('dashboard.command.moneyAtRisk'),
      value: formatPrice(kpis?.moneyAtRisk ?? data?.revenueAtRisk?.total ?? 0),
      hint: data?.revenueAtRisk?.headline || t('dashboard.command.moneyAtRiskHint'),
      icon: ShieldAlert,
      tone: 'danger' as const,
      href: '/conversion/center',
    },
    {
      label: t('dashboard.command.ordersAtRisk'),
      value: String(data?.actions?.cartsToRecover?.length ?? 0),
      hint: t('dashboard.command.ordersAtRiskHint'),
      icon: AlertTriangle,
      tone: 'warning' as const,
      href: '/conversion/center',
    },
    {
      label: t('dashboard.command.recoveryWeek'),
      value: formatPrice(recovery?.recoveredRevenue ?? 0),
      hint: t('dashboard.command.recoveryWeekHint', {
        rate: recovery?.recoveryRate ?? 0,
      }),
      icon: RefreshCw,
      tone: 'success' as const,
      href: '/conversion/center',
    },
    {
      label: t('dashboard.command.deliverySuccess'),
      value: `${(delivery?.successRate ?? kpis?.deliverySuccessRate ?? 0).toFixed(0)}%`,
      hint: t('dashboard.command.deliverySuccessHint', {
        count: delivery?.deliveredCount ?? 0,
      }),
      icon: Truck,
      tone: 'neutral' as const,
      href: '/delivery',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t('dashboard.command.badge')}
          </p>
          <h2 className="text-2xl font-bold tracking-tight">{t('dashboard.command.title')}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            {data?.businessStatus?.message || t('dashboard.command.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="saas-card-interactive" asChild>
            <Link to="/website">
              <Package className="w-4 h-4 mr-2" />
              {t('dashboard.command.openStore')}
            </Link>
          </Button>
          <Button size="sm" className="hover:scale-[1.02] transition-transform" asChild>
            <Link to="/conversion/center">
              {t('dashboard.command.recoverNow')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.label} to={card.href} className="block group">
            <div
              className={`saas-card saas-card-interactive h-full p-5 border-l-4 ${
                card.tone === 'primary'
                  ? 'border-l-[#2563EB]'
                  : card.tone === 'success'
                    ? 'border-l-[#10B981]'
                    : card.tone === 'warning'
                      ? 'border-l-[#F59E0B]'
                      : card.tone === 'danger'
                        ? 'border-l-[#EF4444]'
                        : 'border-l-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <card.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-2xl font-bold mt-2 tabular-nums">{card.value}</p>
              <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{card.hint}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
