import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAi } from '@/contexts/AiContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';
import { Link } from 'react-router-dom';
import {
  RevenueChartWidget,
  TopProductsWidget,
  CodDeliveryPanel,
  ProductPerformancePanel,
  OrderFunnelPanel,
} from '@/components/Dashboard';
import { DashboardSkeleton } from '@/components/ui/loading-skeletons';
import { motion } from 'framer-motion';
import {
  Bot,
  Package,
  DollarSign,
  ShoppingCart,
  Sparkles,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Plus,
  TrendingUp,
  Target,
  Rocket,
  CheckCircle2,
  HelpCircle,
  Truck,
  Trophy,
} from 'lucide-react';

function CountUp({ value, decimals = 1, duration = 800, suffix = '' }: { value: number; decimals?: number; duration?: number; suffix?: string }) {
  const [display, setDisplay] = React.useState(0);
  const startRef = React.useRef<number | null>(null);
  const fromRef = React.useRef(0);

  React.useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, value) : 0;
    fromRef.current = display;
    startRef.current = null;
    let raf = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - (startRef.current as number);
      const t = Math.min(1, elapsed / duration);
      const next = fromRef.current + (target - fromRef.current) * easeOutCubic(t);
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display.toFixed(decimals)}{suffix}</span>;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { recommendations } = useAi();
  const { formatPrice } = useCurrency();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const { data: dashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 60_000,
  });

  const cod = dashboard?.codDelivery;
  const productAnalytics = dashboard?.productAnalytics;
  const funnel = dashboard?.funnel;
  const insights: string[] = dashboard?.insights ?? [];

  const stats = {
    revenue: dashboard?.sales?.totalRevenue ?? 0,
    orders: dashboard?.sales?.totalOrders ?? 0,
    products: dashboard?.inventory?.totalProducts ?? 0,
    customers: dashboard?.sales?.customerMetrics?.totalCustomers ?? 0,
    articlesSold: productAnalytics?.totalArticlesSold ?? 0,
    codDelivered: cod?.delivered ?? 0,
    codSuccessRate: cod?.deliverySuccessRate ?? 0,
    revenueChange: dashboard?.trends?.revenueGrowthPercentage ?? 0,
    ordersChange: dashboard?.trends?.ordersGrowthPercentage ?? 0,
  };

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        <CountUp value={Math.abs(value)} decimals={1} suffix="%" />
      </span>
    );
  };

  return (
    <div className="w-full px-4 py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bonjour {user?.firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tableau de bord · 30 derniers jours · Données en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hover-lift" onClick={() => setShowOnboarding(!showOnboarding)}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Guide
          </Button>
          <Link to="/conversion">
            <Button variant="default" size="sm" className="hover-lift">
              <Target className="w-4 h-4 mr-2" />
              Centre conversion
            </Button>
          </Link>
        </div>
      </div>

      {showOnboarding && (
        <Card className="border-glow glass animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Guide de Démarrage Rapide
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowOnboarding(false)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/products">
                <div className="p-4 rounded-lg bg-gradient-primary text-white hover-scale-glow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Étape 1</span>
                  </div>
                  <p className="text-sm opacity-90">Ajouter vos premiers produits</p>
                </div>
              </Link>
              <Link to="/website">
                <div className="p-4 rounded-lg bg-gradient-secondary text-white hover-scale-glow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="font-semibold">Étape 2</span>
                  </div>
                  <p className="text-sm opacity-90">Créer votre boutique (2 clics)</p>
                </div>
              </Link>
              <Link to="/orders">
                <div className="p-4 rounded-lg bg-gradient-accent text-white hover-scale-glow cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">Étape 3</span>
                  </div>
                  <p className="text-sm opacity-90">Gérer vos commandes COD</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {loadingDashboard && <DashboardSkeleton />}

      {!loadingDashboard && (
        <>
          {/* KPIs principaux */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[
              { title: 'Revenus', value: formatPrice(stats.revenue), change: stats.revenueChange, icon: DollarSign, href: '/analytics?tab=revenue', gradient: 'bg-gradient-primary' },
              { title: 'Commandes', value: stats.orders, change: stats.ordersChange, icon: ShoppingCart, href: '/orders', gradient: 'bg-gradient-secondary' },
              { title: 'Articles vendus', value: stats.articlesSold, icon: Package, href: '/products', gradient: 'bg-gradient-accent' },
              { title: 'Livraisons COD', value: stats.codDelivered, sub: `${stats.codSuccessRate.toFixed(0)}% succès`, icon: Truck, href: '/orders', gradient: 'bg-green-600' },
              { title: 'Produits actifs', value: stats.products, icon: Package, href: '/products', gradient: 'bg-purple-600' },
              { title: 'Clients', value: stats.customers, icon: Users, href: '/customers', gradient: 'bg-orange-500' },
            ].map((kpi) => (
              <Link key={kpi.title} to={kpi.href}>
                <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{kpi.title}</span>
                      <div className={`p-1.5 rounded-lg ${kpi.gradient}`}>
                        <kpi.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-xl font-bold">{kpi.value}</p>
                    {'change' in kpi && kpi.change !== undefined ? (
                      <div className="text-xs mt-1">{formatPercentage(kpi.change as number)}</div>
                    ) : kpi.sub ? (
                      <p className="text-xs text-green-600 mt-1">{kpi.sub}</p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>

          {/* Insights automatiques */}
          {insights.length > 0 && (
            <Card className="border-blue-100 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    {insights.slice(0, 4).map((insight, i) => (
                      <p key={i} className="text-sm text-blue-900">{insight}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section COD / Livraison */}
          <CodDeliveryPanel data={cod} formatCurrency={formatPrice} />

          {/* Graphiques revenus + top produits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChartWidget days={30} />
            </div>
            <div>
              <TopProductsWidget limit={5} />
            </div>
          </div>

          {/* Performance produits + Funnel */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProductPerformancePanel data={productAnalytics} formatCurrency={formatPrice} />
            <OrderFunnelPanel funnel={funnel} />
          </div>

          {/* Produit gagnant rapide si pas de ventes dans product panel */}
          {productAnalytics?.winningProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Résumé rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{cod?.totalCodOrders ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Commandes COD</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{cod?.delivered ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Livrées</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">{cod?.cancelled ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Non livrées</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">
                      {productAnalytics.winningProduct.salesPercentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={productAnalytics.winningProduct.title}>
                      Top : {productAnalytics.winningProduct.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.revenue === 0 && stats.orders === 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Bienvenue dans votre tableau de bord !</h3>
                    <p className="text-blue-700 mt-1 text-sm">
                      Ajoutez des produits et recevez vos premières commandes COD pour voir livraisons, articles vendus et produit gagnant ici.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Link to="/products"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Produits</Button></Link>
                      <Link to="/website"><Button size="sm" variant="outline">Créer ma boutique</Button></Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Recommandations IA */}
      <Card className="glass border-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Recommandations IA
            </CardTitle>
            <Badge>Nouveau</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec: { title: string; description: string; priority: string }, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{rec.priority}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">L&apos;IA analyse vos données pour générer des recommandations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
