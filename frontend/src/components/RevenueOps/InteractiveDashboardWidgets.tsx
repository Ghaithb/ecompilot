import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  DollarSign,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RevenueOpsDashboardData } from './types';

function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    const start = display;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (target - start) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return display;
}

type KpiCard = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  href: string;
  icon: typeof ShoppingCart;
  tone?: 'default' | 'danger' | 'success';
};

export function DashboardHeaderActions({
  updatedAt,
  onRefresh,
  isRefreshing,
}: {
  updatedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-TN' : 'fr-TN';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {updatedAt && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(updatedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-8">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('dashboard.refresh')}
        </Button>
      )}
    </div>
  );
}

export function KpiStrip({ data }: { data: RevenueOpsDashboardData }) {
  const { t } = useTranslation();
  const kpis = data.kpis;
  const money = data.money;

  const cards: KpiCard[] = [
    {
      id: 'orders',
      label: t('dashboard.kpi.ordersToday'),
      value: kpis.ordersToday,
      href: '/orders',
      icon: ShoppingCart,
    },
    {
      id: 'cod',
      label: t('dashboard.kpi.codPending'),
      value: money.codAtRisk,
      suffix: 'TND',
      decimals: 0,
      href: '/orders',
      icon: DollarSign,
      tone: money.codAtRisk > 0 ? 'danger' : 'default',
    },
    {
      id: 'risk',
      label: t('dashboard.kpi.revenueAtRiskShort'),
      value: data.revenueAtRisk.total,
      suffix: 'TND',
      decimals: 0,
      href: '/conversion/center',
      icon: TrendingUp,
      tone: data.revenueAtRisk.total > 0 ? 'danger' : 'default',
    },
    {
      id: 'recovery',
      label: t('dashboard.kpi.recovered'),
      value: data.recoveryPerformance.recoveredRevenue,
      suffix: 'TND',
      decimals: 0,
      href: '/conversion/center',
      icon: Sparkles,
      tone: 'success',
    },
    {
      id: 'delivery',
      label: t('dashboard.kpi.deliverySuccess'),
      value: data.delivery.successRate,
      suffix: '%',
      decimals: 0,
      href: '/delivery/connect',
      icon: Truck,
    },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <KpiCardLink key={card.id} card={card} />
      ))}
    </section>
  );
}

function KpiCardLink({ card }: { card: KpiCard }) {
  const animated = useCountUp(card.value);
  const Icon = card.icon;
  const toneClass =
    card.tone === 'danger'
      ? 'hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20'
      : card.tone === 'success'
        ? 'hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
        : 'hover:border-primary/40 hover:bg-primary/5';

  return (
    <Link
      to={card.href}
      className={`group rounded-2xl border bg-card px-4 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">{card.label}</p>
      <p className="text-2xl font-semibold tabular-nums mt-1 tracking-tight">
        {animated.toFixed(card.decimals ?? 0)}
        {card.suffix && <span className="text-sm font-medium text-muted-foreground ml-0.5">{card.suffix}</span>}
      </p>
    </Link>
  );
}

export function InsightsPanel({ insights }: { insights: RevenueOpsDashboardData['insights'] }) {
  const { t } = useTranslation();
  if (!insights?.length) return null;

  const severityStyle = {
    critical: 'border-red-200 bg-red-50/60 dark:bg-red-950/20',
    warning: 'border-amber-200 bg-amber-50/60 dark:bg-amber-950/20',
    positive: 'border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20',
    info: 'border-border bg-muted/30',
  };

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight px-1">{t('dashboard.insightsTitle')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.slice(0, 4).map((insight) => (
          <div
            key={insight.id}
            className={`rounded-2xl border px-4 py-4 transition-all hover:shadow-sm ${severityStyle[insight.severity]}`}
          >
            <p className="font-medium text-sm leading-snug">{insight.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.message}</p>
            {insight.actionHref && insight.actionLabel && (
              <Button variant="link" className="h-auto p-0 mt-2 text-xs" asChild>
                <Link to={insight.actionHref}>
                  {insight.actionLabel} <ArrowRight className="h-3 w-3 ml-1 inline" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TopProductsPanel({
  products,
}: {
  products: RevenueOpsDashboardData['topConvertingProducts'];
}) {
  const { t } = useTranslation();
  if (!products?.length) return null;

  return (
    <section className="rounded-2xl bg-muted/10 px-5 py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.topProducts')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.topProductsSubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/products">{t('dashboard.manage')}</Link>
        </Button>
      </div>
      <ul className="space-y-2">
        {products.slice(0, 5).map((p, i) => (
          <li key={p.title}>
            <Link
              to="/products"
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-background/80 group"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="truncate font-medium">{p.title}</span>
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="font-semibold">{p.revenue.toFixed(0)} TND</span>
                <span className="block text-[10px] text-muted-foreground">
                  {t('dashboard.ordersShort', { count: p.orders })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type TrendMetric = 'orders' | 'recovered' | 'conversion';

export function InteractiveTrendChart({
  trends,
  activeMetric,
  onMetricChange,
}: {
  trends: RevenueOpsDashboardData['trends'];
  activeMetric: TrendMetric;
  onMetricChange: (m: TrendMetric) => void;
}) {
  const { t } = useTranslation();
  const metrics: { id: TrendMetric; label: string; data: Array<{ date: string; value: number }>; color: string }[] = [
    { id: 'orders', label: t('dashboard.ordersTrend'), data: trends.orders ?? [], color: 'hsl(var(--primary))' },
    { id: 'recovered', label: t('dashboard.recoveredTrend'), data: trends.recovered ?? [], color: '#059669' },
    { id: 'conversion', label: t('dashboard.conversionTrend'), data: trends.conversion ?? [], color: '#d97706' },
  ];

  const current = metrics.find((m) => m.id === activeMetric) ?? metrics[0];
  const data = current.data;
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hovered, setHovered] = useState<number | null>(null);

  if (!data.length) return null;

  return (
    <section className="rounded-2xl bg-muted/10 px-5 py-6 lg:col-span-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.trends7d')}</h2>
        <div className="flex flex-wrap gap-1.5">
          {metrics.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onMetricChange(m.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeMetric === m.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 h-32 mb-2">
        {data.map((d, i) => {
          const height = Math.max(8, Math.round((d.value / max) * 100));
          const isHover = hovered === i;
          return (
            <button
              key={d.date}
              type="button"
              className="group flex-1 flex flex-col items-center justify-end min-w-[28px] h-full"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
            >
              <span
                className={`mb-1 text-[10px] font-semibold tabular-nums transition-opacity ${
                  isHover ? 'opacity-100 text-foreground' : 'opacity-0'
                }`}
              >
                {d.value}
              </span>
              <div
                className="w-full max-w-[48px] rounded-t-md transition-all duration-300"
                style={{
                  height: `${height}%`,
                  backgroundColor: current.color,
                  opacity: isHover ? 1 : 0.65,
                  transform: isHover ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                }}
              />
              <span className="mt-2 text-[9px] text-muted-foreground truncate w-full text-center">
                {d.date.slice(5)}
              </span>
            </button>
          );
        })}
      </div>

      {hovered !== null && data[hovered] && (
        <p className="text-xs text-center text-muted-foreground">
          <Package className="h-3 w-3 inline mr-1" />
          {current.label} · {data[hovered].date} · <strong>{data[hovered].value}</strong>
        </p>
      )}
    </section>
  );
}
