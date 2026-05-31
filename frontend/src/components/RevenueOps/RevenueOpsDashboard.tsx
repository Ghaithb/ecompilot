import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Phone,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DashboardHeaderActions,
  InsightsPanel,
  InteractiveTrendChart,
  KpiStrip,
  TopProductsPanel,
  type TrendMetric,
} from './InteractiveDashboardWidgets';
import type {
  BusinessStatus,
  HealthScore,
  HealthTrend,
  RevenueOpsDashboardData,
  TodayFocusItem,
} from './types';

const PROVIDER_LABELS: Record<string, string> = {
  first_delivery: 'First Delivery',
  intigo: 'INTIGO',
  shipper: 'Shipper',
};

function scoreTone(score: number) {
  if (score >= 70) return 'text-emerald-600';
  if (score >= 45) return 'text-amber-600';
  return 'text-red-600';
}

function TrendIcon({ trend }: { trend: HealthTrend }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-emerald-600" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function StatusIcon({ tone }: { tone: BusinessStatus['tone'] }) {
  if (tone === 'critical') return <Flame className="h-5 w-5 text-red-500" />;
  if (tone === 'warning') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  if (tone === 'growth') return <Sparkles className="h-5 w-5 text-violet-500" />;
  return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
}

function statusSurface(tone: BusinessStatus['tone']) {
  switch (tone) {
    case 'critical':
      return 'from-red-500/[0.06] to-background';
    case 'warning':
      return 'from-amber-500/[0.06] to-background';
    case 'growth':
      return 'from-violet-500/[0.06] to-background';
    default:
      return 'from-emerald-500/[0.05] to-background';
  }
}

function urgencyBadge(level: TodayFocusItem['urgencyLevel']) {
  const map = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    high: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    medium: 'bg-muted text-muted-foreground',
  };
  return map[level];
}

function BusinessStatusHero({ status }: { status: BusinessStatus }) {
  const { t } = useTranslation();
  return (
    <section
      className={`rounded-3xl bg-gradient-to-br ${statusSurface(status.tone)} px-6 py-8 sm:px-8 sm:py-10`}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
        {t('dashboard.businessStatus')}
      </p>
      <div className="flex items-start gap-4">
        <div className="mt-1 shrink-0">
          <StatusIcon tone={status.tone} />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            {status.message}
          </h2>
          {status.detail && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {status.detail}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function RevenueAtRiskPanel({ revenueAtRisk }: { revenueAtRisk: RevenueOpsDashboardData['revenueAtRisk'] }) {
  const { t } = useTranslation();
  if (revenueAtRisk.total <= 0) {
    return (
      <div className="rounded-2xl bg-muted/30 px-5 py-4 flex items-center gap-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <p className="text-sm text-muted-foreground">{t('dashboard.noCriticalRevenue')}</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-muted/20 px-5 py-5 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1">
            {t('dashboard.revenueAtRisk')}
          </p>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-red-600 dark:text-red-400">
            {revenueAtRisk.total.toFixed(0)} <span className="text-lg font-medium">TND</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">{revenueAtRisk.headline}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(revenueAtRisk.breakdown ?? []).map((row) => (
          <span
            key={row.label}
            className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold tabular-nums">{row.amount.toFixed(0)} TND</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function TopPrioritiesPanel({ items, zeroNoise }: { items: TodayFocusItem[]; zeroNoise: boolean }) {
  const { t } = useTranslation();
  if (!items.length) {
    return (
      <section className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/15 px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400 mb-2">
          {t('dashboard.prioritiesToday')}
        </p>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{t('dashboard.noUrgency')}</p>
            {zeroNoise && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('dashboard.focusGrowth')}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3 px-1">
        {t('dashboard.top3Today')}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={item.href}
            className="group rounded-2xl bg-card hover:bg-muted/30 transition-colors px-5 py-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${urgencyBadge(item.urgencyLevel)}`}>
                {item.urgencyLevel === 'critical' ? t('dashboard.urgent') : item.urgencyLevel === 'high' ? t('dashboard.important') : t('dashboard.moderate')}
              </span>
            </div>
            <div>
              <p className="font-semibold leading-snug">{item.title}</p>
              <p className="text-2xl font-bold tabular-nums mt-2 tracking-tight">
                {item.moneyImpact.toFixed(0)} <span className="text-sm font-medium text-muted-foreground">TND</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{item.suggestedAction}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              {t('dashboard.act')} <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExecutiveNarrative({
  narrative,
  expanded,
  onToggle,
}: {
  narrative: RevenueOpsDashboardData['narrative'];
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl bg-muted/15 px-5 py-5 sm:px-6 space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {t('dashboard.executiveSummary')}
        </p>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <>
          {narrative.summary && (
            <p className="text-sm leading-relaxed text-foreground/90">{narrative.summary}</p>
          )}
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <p className="font-medium text-muted-foreground">{t('dashboard.today')}</p>
              {narrative.happened.map((line) => (
                <p key={line} className="leading-relaxed">{line}</p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-emerald-700 dark:text-emerald-400">{t('dashboard.improved')}</p>
              {narrative.improved.map((line) => (
                <p key={line} className="text-muted-foreground leading-relaxed">{line}</p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-amber-700 dark:text-amber-400">{t('dashboard.watch')}</p>
              {narrative.decreased.map((line) => (
                <p key={line} className="text-muted-foreground leading-relaxed">{line}</p>
              ))}
            </div>
          </div>
          {narrative.recommended[0] && (
            <p className="text-xs pt-3 border-t border-border/50">
              <span className="font-medium">{t('dashboard.recommendedAction')} </span>
              {narrative.recommended.join(' · ')}
            </p>
          )}
        </>
      )}
    </section>
  );
}

function HealthScoresRow({ health }: { health: RevenueOpsDashboardData['healthScores'] }) {
  const { t } = useTranslation();
  const scores: HealthScore[] = [
    { ...health.store, label: t('dashboard.storeHealth') },
    health.delivery,
    health.recovery,
  ];

  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="rounded-2xl bg-muted/20 px-4 py-4 sm:col-span-2 lg:col-span-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {health.revenueHealthLabel}
        </p>
        <p className={`text-3xl font-semibold tabular-nums mt-1 ${scoreTone(health.revenueHealth)}`}>
          {health.revenueHealth}/100
        </p>
      </div>
      {scores.map((s) => (
        <div key={s.label} className="rounded-2xl bg-muted/20 px-4 py-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-medium">{s.label}</p>
            <TrendIcon trend={s.trend} />
          </div>
          <p className={`text-2xl font-semibold tabular-nums ${scoreTone(s.score)}`}>{s.score}/100</p>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{s.primaryIssue}</p>
        </div>
      ))}
    </section>
  );
}

function FunnelPanel({
  funnel,
  activeStep,
  onStepClick,
}: {
  funnel: RevenueOpsDashboardData['funnel'];
  activeStep: string | null;
  onStepClick: (key: string) => void;
}) {
  const { t } = useTranslation();
  const maxCount = Math.max(...funnel.map((s) => s.count), 1);
  const cartStep = funnel.find((s) => s.key === 'cart');
  const selected = funnel.find((s) => s.key === activeStep);

  return (
    <section className="rounded-2xl bg-muted/10 px-5 py-6 sm:px-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.revenueFunnel')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.funnelClickHint')}</p>
      </div>
      <div className="space-y-4">
        {funnel.map((step, i) => {
          const width = Math.max(8, Math.round((step.count / maxCount) * 100));
          const isLast = i === funnel.length - 1;
          const isActive = activeStep === step.key;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepClick(step.key)}
              className={`w-full text-left rounded-xl transition-colors ${
                step.isFrictionPoint ? 'bg-amber-500/[0.06]' : ''
              } ${isActive ? 'ring-2 ring-primary/30 bg-primary/5 px-2 py-2 -mx-2' : 'hover:bg-muted/40 px-2 py-2 -mx-2'}`}
            >
              <div className="flex justify-between items-baseline gap-3 text-sm mb-1.5">
                <span className="font-medium">{step.label}</span>
                <span className="tabular-nums text-muted-foreground">{step.count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    step.isFrictionPoint ? 'bg-amber-500/80' : isActive ? 'bg-primary' : 'bg-primary/60'
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
              {!isLast && (step.moneyLost ?? 0) > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {t('dashboard.funnelLostDetail', {
                    loss: step.loss,
                    amount: step.moneyLost?.toFixed(0),
                    rate: step.dropRate,
                  })}
                  {step.isFrictionPoint && t('dashboard.frictionPoint')}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border bg-background/80 px-4 py-3 text-sm animate-in fade-in duration-200">
          <p className="font-medium">{selected.label}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {t('dashboard.funnelEntries', { count: selected.count })}
            {(selected.moneyLost ?? 0) > 0 && ` · ~${selected.moneyLost?.toFixed(0)} TND`}
            {selected.isFrictionPoint && t('dashboard.funnelFrictionDetected')}
          </p>
          {selected.key === 'cart' && (
            <Button size="sm" className="mt-3" asChild>
              <Link to="/conversion/center">{t('dashboard.relaunchCarts')}</Link>
            </Button>
          )}
          {selected.key === 'order' && (
            <Button size="sm" className="mt-3" asChild>
              <Link to="/orders">{t('dashboard.viewOrders')}</Link>
            </Button>
          )}
        </div>
      )}

      {cartStep && (cartStep.moneyAtRisk ?? 0) > 0 && (
        <div className="mt-5 pt-4 border-t border-border/40 grid sm:grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t('dashboard.atRisk')}</p>
            <p className="font-semibold tabular-nums text-red-600">{cartStep.moneyAtRisk?.toFixed(0)} TND</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('dashboard.recovery')}</p>
            <p className="font-semibold tabular-nums">{cartStep.recoveryRate}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('dashboard.recovered')}</p>
            <p className="font-semibold tabular-nums text-emerald-600">{cartStep.recoveredRevenue?.toFixed(0)} TND</p>
          </div>
        </div>
      )}
    </section>
  );
}

function MoneyLeakagePanel({ items }: { items: RevenueOpsDashboardData['moneyLeakage'] }) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl bg-muted/10 px-5 py-6 sm:px-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.moneyLeakage')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.leakageSubtitle')}</p>
      </div>
      <div className="space-y-4">
        {items.map((row) => (
          <div key={row.id} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{row.label}</p>
              {row.lostTND > 0 ? (
                <p className="text-sm tabular-nums text-red-600 dark:text-red-400 mt-0.5">
                  {t('dashboard.atRiskAmount', { amount: row.lostTND.toFixed(0) })}
                </p>
              ) : (
                <p className="text-sm tabular-nums text-emerald-600 mt-0.5">
                  {t('dashboard.recoveredAmount', { amount: row.recoverableTND.toFixed(0) })}
                </p>
              )}
            </div>
            {row.recoverableTND > 0 && row.lostTND > 0 && (
              <span className="text-xs font-medium text-emerald-600 tabular-nums shrink-0">
                {t('dashboard.recoverableAmount', { amount: row.recoverableTND.toFixed(0) })}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionSidebar({
  actions,
  quickActions,
}: {
  actions: RevenueOpsDashboardData['actions'];
  quickActions: RevenueOpsDashboardData['quickActions'];
}) {
  const { t } = useTranslation();
  const total =
    actions.cartsToRecover.length + actions.codToConfirm.length + actions.failedDeliveries.length;

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      <section className="rounded-2xl bg-muted/10 px-5 py-6">
        <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.actionCenter')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">{t('dashboard.actionCenterSubtitle')}</p>

        {total === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {t('dashboard.nothingUrgent')}
          </div>
        ) : (
          <div className="space-y-5">
            {actions.cartsToRecover.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <ShoppingCart className="h-3 w-3" /> {t('dashboard.carts')}
                </p>
                <ul className="space-y-2">
                  {actions.cartsToRecover.slice(0, 3).map((c) => (
                    <li key={c.id}>
                      <Link
                        to="/conversion/center"
                        className="flex justify-between text-sm gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-muted/60 transition-colors"
                      >
                        <span className="truncate">{c.customerName}</span>
                        <span className="font-medium tabular-nums shrink-0">{c.total.toFixed(0)} TND</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {actions.codToConfirm.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Phone className="h-3 w-3" /> COD
                </p>
                <ul className="space-y-2">
                  {actions.codToConfirm.slice(0, 3).map((o) => (
                    <li key={o.id}>
                      <Link
                        to="/orders"
                        className="flex justify-between text-sm gap-2 rounded-lg px-2 py-1.5 -mx-2 hover:bg-muted/60 transition-colors group"
                      >
                        <span className="group-hover:text-primary">{o.orderNumber}</span>
                        <span className="tabular-nums font-medium">{o.total.toFixed(0)} TND</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {actions.failedDeliveries.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Truck className="h-3 w-3" /> {t('dashboard.deliveries')}
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {actions.failedDeliveries.slice(0, 3).map((s) => (
                    <li key={s.id}>{s.trackingNumber}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-muted/10 px-5 py-6">
        <h2 className="text-sm font-semibold tracking-tight mb-4">{t('dashboard.quickActions')}</h2>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Button key={action.href + action.label} variant="outline" className="w-full justify-between h-auto py-3" asChild>
              <Link to={action.href}>
                <span className="text-left text-sm font-normal">{action.label}</span>
                {action.impact && (
                  <span className="text-xs font-semibold tabular-nums text-primary">{action.impact}</span>
                )}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </aside>
  );
}

/** Merchant Command Center — intelligent revenue decision system */
export function RevenueOpsDashboard({
  data,
  userName,
  onRefresh,
  isRefreshing,
}: {
  data: RevenueOpsDashboardData;
  userName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [funnelStep, setFunnelStep] = useState<string | null>(null);
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('orders');
  const [narrativeExpanded, setNarrativeExpanded] = useState(true);

  const toggleFunnelStep = (key: string) => {
    setFunnelStep((prev) => (prev === key ? null : key));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {t('dashboard.title')}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
            {userName ? t('dashboard.greeting', { name: userName }) : t('dashboard.greetingFallback')}
          </h1>
        </div>
        <DashboardHeaderActions
          updatedAt={data.updatedAt}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      </header>

      <KpiStrip data={data} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('dashboard.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="sales" className="text-xs sm:text-sm">{t('dashboard.tabs.sales')}</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs sm:text-sm">{t('dashboard.tabs.delivery')}</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs sm:text-sm">{t('dashboard.tabs.actions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <BusinessStatusHero status={data.businessStatus} />

          {data.zeroNoise ? (
            <HealthyStoreSummary status={data.businessStatus} opportunities={data.growthOpportunities} />
          ) : (
            <>
              <RevenueAtRiskPanel revenueAtRisk={data.revenueAtRisk} />
              <TopPrioritiesPanel items={data.todayFocus} zeroNoise={data.zeroNoise} />
              {data.growthOpportunities.length > 0 && (
                <GrowthOpportunities items={data.growthOpportunities} />
              )}
            </>
          )}

          <InsightsPanel insights={data.insights} />
          <ExecutiveNarrative
            narrative={data.narrative}
            expanded={narrativeExpanded}
            onToggle={() => setNarrativeExpanded((v) => !v)}
          />
          <HealthScoresRow health={data.healthScores} />
          <TopProductsPanel products={data.topConvertingProducts} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6 mt-0">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
            <FunnelPanel funnel={data.funnel} activeStep={funnelStep} onStepClick={toggleFunnelStep} />
            <ActionSidebar actions={data.actions} quickActions={data.quickActions} />
          </div>
          <MoneyLeakagePanel items={data.moneyLeakage} />
          <RecoveryPerformancePanel recovery={data.recoveryPerformance} />
          <InteractiveTrendChart
            trends={data.trends}
            activeMetric={trendMetric}
            onMetricChange={setTrendMetric}
          />
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6 mt-0">
          <DeliveryIntelligence delivery={data.delivery} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Button variant="outline" asChild className="h-auto py-4 justify-start">
              <Link to="/delivery/connect">
                <Truck className="h-5 w-5 mr-3 shrink-0" />
                <span className="text-left">
                  <span className="block font-medium">{t('dashboard.connectCarrier')}</span>
                  <span className="text-xs text-muted-foreground font-normal">{t('dashboard.connectCarrierHint')}</span>
                </span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 justify-start">
              <Link to="/orders">
                <ShoppingCart className="h-5 w-5 mr-3 shrink-0" />
                <span className="text-left">
                  <span className="block font-medium">{t('dashboard.trackOrders')}</span>
                  <span className="text-xs text-muted-foreground font-normal">{t('dashboard.trackOrdersHint')}</span>
                </span>
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6 mt-0">
          <TopPrioritiesPanel items={data.todayFocus} zeroNoise={data.zeroNoise} />
          <div className="grid lg:grid-cols-2 gap-6">
            <ActionSidebar actions={data.actions} quickActions={data.quickActions} />
            <section className="rounded-2xl bg-muted/10 px-5 py-6 space-y-3">
              <h2 className="text-sm font-semibold">{t('dashboard.shortcutsStore')}</h2>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/products">{t('dashboard.editProducts')}</Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/website">{t('dashboard.changeTheme')}</Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/conversion/center">{t('dashboard.conversionCenterLink')}</Link>
                </Button>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeliveryIntelligence({ delivery }: { delivery: RevenueOpsDashboardData['delivery'] }) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl bg-muted/10 px-5 py-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{t('dashboard.deliveryIntel')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard.deliveryIntelSubtitle')}</p>
        </div>
        <TrendIcon trend={delivery.successTrend} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.success')}</p>
          <p className="text-xl font-semibold tabular-nums">{delivery.successRate}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.failures')}</p>
          <p className={`text-xl font-semibold tabular-nums ${delivery.failedDeliveries ? 'text-red-600' : ''}`}>
            {delivery.failedDeliveries}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.delays')}</p>
          <p className={`text-xl font-semibold tabular-nums ${delivery.delayedShipments ? 'text-amber-600' : ''}`}>
            {delivery.delayedShipments}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.impact')}</p>
          <p className="text-xl font-semibold tabular-nums">{delivery.estimatedImpact.toFixed(0)} TND</p>
        </div>
      </div>
      <ul className="space-y-2 text-xs text-muted-foreground">
        {delivery.insights.map((line) => (
          <li key={line} className="leading-relaxed">{line}</li>
        ))}
      </ul>
      {delivery.bestCarrier && (
        <p className="text-xs mt-3 pt-3 border-t border-border/40">
          {t('dashboard.bestCarrier')}{' '}
          <span className="font-medium text-foreground">
            {PROVIDER_LABELS[delivery.bestCarrier.provider] || delivery.bestCarrier.provider}
          </span>
          {' '}· {delivery.bestCarrier.successRate}% · {delivery.bestCarrier.avgDays || '—'} {t('store.days')}
        </p>
      )}
    </section>
  );
}

function RecoveryPerformancePanel({ recovery }: { recovery: RevenueOpsDashboardData['recoveryPerformance'] }) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl bg-muted/10 px-5 py-6">
      <h2 className="text-sm font-semibold tracking-tight mb-1">{t('dashboard.recoveryPerformance')}</h2>
      <p className="text-xs text-muted-foreground mb-4">{recovery.insight}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.rate')}</p>
          <p className="text-xl font-semibold tabular-nums">{recovery.recoveryRate}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.recovered')}</p>
          <p className="text-xl font-semibold tabular-nums text-emerald-600">{recovery.recoveredRevenue.toFixed(0)} TND</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.reminders')}</p>
          <p className="text-xl font-semibold tabular-nums">{recovery.recoveriesSent}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">{t('dashboard.channel')}</p>
          <p className="text-sm font-medium mt-1">{recovery.bestChannel || '—'}</p>
        </div>
      </div>
    </section>
  );
}

function GrowthOpportunities({ items }: { items: string[] }) {
  const { t } = useTranslation();
  if (!items.length) return null;
  return (
    <section className="rounded-2xl bg-violet-500/[0.04] px-5 py-5">
      <p className="text-[11px] uppercase tracking-[0.15em] text-violet-700 dark:text-violet-400 mb-3">
        {t('dashboard.growthOpportunities')}
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** État sain consolidé — évite 3 cartes vertes répétitives */
function HealthyStoreSummary({
  opportunities,
}: {
  status: BusinessStatus;
  opportunities: string[];
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-900 dark:text-emerald-100">{t('dashboard.noCriticalRevenue')}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-medium">{t('dashboard.noUrgency')}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.focusGrowth')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link to="/website">{t('dashboard.command.openStore')}</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/products">{t('dashboard.page.addProducts')}</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/conversion/center">{t('dashboard.command.recoverNow')}</Link>
        </Button>
      </div>

      <GrowthOpportunities items={opportunities} />
    </div>
  );
}
