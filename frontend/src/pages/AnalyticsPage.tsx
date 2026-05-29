import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { aiApi } from '@/lib/api';
import { analyticsApi } from '../lib/analyticsApi';
import { exportAnalyticsCsv } from '@/utils/exportCsv';
import { formatCurrency as formatCurrencyUtil } from '@/utils/analyticsHelpers';
import { RefreshCw, Download, FileText, Shield, TrendingUp, DollarSign, Package, AlertTriangle, Bot } from 'lucide-react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Type definitions for analyticsApi
interface SalesParams {
  startDate?: string;
  endDate?: string;
  channel?: string;
  category?: string;
}
interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{ period: string; revenue: number; orders: number; channel?: string }>;
  topSellingProducts: Array<{ productId: string; title: string; quantitySold: number; revenue: number; category?: string; channel?: string }>;
  salesByCategory: Array<{ name: string; value: number }>;
}

interface InventoryMetrics {
  totalProducts: number;
  totalVariants: number;
  totalInventoryValue: number;
  outOfStockItems: number;
  lowStockItems: number;
  inStockItems: number;
}

interface AnalyticsApi {
  getSales: (params?: SalesParams) => Promise<SalesMetrics>;
  getInventory: () => Promise<InventoryMetrics>;
  exportData: (type?: 'sales' | 'inventory' | 'all', format?: 'csv' | 'json') => Promise<any>;
}

// Apply AnalyticsApi type to analyticsApi
const typedAnalyticsApi: AnalyticsApi = analyticsApi;

// Type definition for DateRangePicker (aligned with react-day-picker)
interface DateRange {
  from?: Date;
  to?: Date;
}

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable?: { finalY: number };
}


const AnalyticsPage: React.FC = () => {
  // State variables
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorChart, setErrorChart] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);

  // Fournisseurs marketing supportés
  const marketingProviders = [
    { value: 'google', label: 'Google Ads' },
    { value: 'meta', label: 'Meta (Facebook/Instagram)' },
    { value: 'tiktok', label: 'TikTok Ads' },
    { value: 'linkedin', label: 'LinkedIn Ads' },
  ];
  const [selectedProviders, setSelectedProviders] = useState<string[]>(marketingProviders.map(p => p.value));

  // Liste des catégories disponibles
  const categories = useMemo(() => [
    'Électronique',
    'Mode',
    'Maison',
    'Sports',
    'Jardin',
    'Auto',
    'Alimentation',
    'Beauté',
    'Jouets',
    'Livres'
  ], []);

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Périodes disponibles
  const periods = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '90 jours' }
  ];

  // Calcul des dates de période
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now);
    if (selectedPeriod === '7d') start.setDate(start.getDate() - 7);
    else if (selectedPeriod === '30d') start.setDate(start.getDate() - 30);
    else if (selectedPeriod === '90d') start.setDate(start.getDate() - 90);
    return { startDate: start.toISOString().slice(0, 10), endDate: end };
  }, [selectedPeriod]);

  // Récupération de la comparaison multi-canal (après startDate/endDate)
  const { data: marketingComparison, isLoading: loadingMarketingComparison } = useQuery({
    queryKey: ['marketing', 'compare', selectedProviders, startDate, endDate],
    queryFn: () => analyticsApi.getMarketingComparison({
      providers: selectedProviders,
      startDate,
      endDate,
    }),
    enabled: selectedProviders.length > 0,
    staleTime: 60_000,
  });

  // Récupération des analyses IA
  const { data: salesForecasts, isLoading: loadingForecasts, refetch: refetchForecasts } = useQuery({
    queryKey: ['ai', 'sales-forecasts', selectedPeriod],
    queryFn: () => aiApi.getSalesForecasts(selectedPeriod),
  });

  const { data: financialAnalysis, isLoading: loadingFinancial, refetch: refetchFinancial } = useQuery({
    queryKey: ['ai', 'financial-analysis', selectedPeriod],
    queryFn: aiApi.getFinancialAnalysis,
  });

  const { data: inventoryAnalysis, isLoading: loadingInventory, refetch: refetchInventory } = useQuery({
    queryKey: ['ai', 'inventory-analysis'],
    queryFn: aiApi.getInventoryAnalysis,
  });

  const { data: anomalies, isLoading: loadingAnomalies, refetch: refetchAnomalies } = useQuery({
    queryKey: ['ai', 'anomalies'],
    queryFn: aiApi.getSecurityAnomalies,
  });


  // Fetch sales metrics from backend with all filters
  const { data: salesMetrics, isLoading: loadingSales } = useQuery({
    queryKey: ['analytics', 'sales', startDate, endDate, selectedChannel, selectedCategory],
    queryFn: () => typedAnalyticsApi.getSales({ 
      startDate, 
      endDate,
      channel: selectedChannel === 'all' ? undefined : selectedChannel,
      category: selectedCategory === 'all' ? undefined : selectedCategory
    }),
    staleTime: 60_000,
  });

  // Fetch inventory metrics
  const { data: inventoryMetrics, isLoading: loadingInv } = useQuery({
    queryKey: ['analytics', 'inventory'],
    queryFn: typedAnalyticsApi.getInventory,
    staleTime: 60_000,
  });

  // Fonction pour filtrer les données en fonction des sélections
  const filterData = useCallback((data: SalesMetrics | undefined) => {
    if (!data) return data;

    let filtered = { ...data };

    if (selectedChannel !== 'all') {
      filtered.revenueByPeriod = filtered.revenueByPeriod?.filter((r: any) => r.channel === selectedChannel);
      filtered.topSellingProducts = filtered.topSellingProducts?.filter((p: any) => p.channel === selectedChannel);
    }

    if (selectedCategory !== 'all') {
      filtered.topSellingProducts = filtered.topSellingProducts?.filter((p: any) => p.category === selectedCategory);
    }

    return filtered;
  }, [selectedChannel, selectedCategory]);

  // Build chart rows from salesMetrics
  useEffect(() => {
    setLoadingChart(true);
    try {
      const filteredMetrics = filterData(salesMetrics);
      const rows = Array.isArray(filteredMetrics?.revenueByPeriod)
        ? filteredMetrics.revenueByPeriod.map((r: any) => ({ 
            month: r.period, 
            total: r.revenue, 
            orders: r.orders,
            channel: r.channel 
          }))
        : [];
      setSalesData(rows);
      setErrorChart(null);
    } catch (e: any) {
      setErrorChart(e.message);
    } finally {
      setLoadingChart(false);
    }
  }, [salesMetrics, filterData]);

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount);
  }

  const refreshAllAnalytics = () => {
    refetchForecasts();
    refetchFinancial();
    refetchInventory();
    refetchAnomalies();
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      exportAnalyticsCsv(salesData, `analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  // Export PDF détaillé avec tous les graphiques et KPIs
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF() as JsPDFWithAutoTable;
      
      // Page 1: En-tête et KPIs principaux
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text('Rapport Analytics IA', 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(127, 140, 141);
      doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      doc.text(`Période d'analyse: ${selectedPeriod}`, 14, 36);

      // KPIs principaux
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text('Indicateurs Clés de Performance', 14, 50);
      // ...existing code...
    } catch (e) {
      console.error(e);
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics IA</h1>
          <p className="text-gray-600 mt-1">
            Insights et prévisions alimentés par l'intelligence artificielle
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedChannel || "all"} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Canal de vente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les canaux</SelectItem>
                <SelectItem value="web">Site Web</SelectItem>
                <SelectItem value="marketplace">Place de marché</SelectItem>
                <SelectItem value="pos">Point de vente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory || "all"} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker
              from={new Date(startDate)}
              to={new Date(endDate)}
              onSelect={(range: DateRange | undefined) => {
                if (range && range.from && range.to) {
                  setSelectedPeriod('custom');
                  setSalesData([]); // Reset sales data to trigger refetch
                }
              }}
            />
          </div>
          <Button 
            onClick={refreshAllAnalytics}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button
            onClick={handleExportCsv}
            variant="secondary"
            className="flex items-center gap-2"
            disabled={exporting}
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Export...' : 'Exporter CSV'}
          </Button>
          <Button
            onClick={handleExportPdf}
            variant="secondary"
            className="flex items-center gap-2"
            disabled={exportingPdf}
          >
            <FileText className="w-4 h-4" />
            {exportingPdf ? 'Export PDF...' : 'Exporter PDF'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="forecasts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Prévisions
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financier
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Inventaire
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Onglet Prévisions */}
        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Prévisions de Ventes IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingForecasts ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : salesForecasts ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(salesForecasts.predictedRevenue || 0)}
                        </div>
                        <div className="text-sm text-gray-600">CA Prévu</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {salesForecasts.predictedOrders || 0}
                        </div>
                        <div className="text-sm text-gray-600">Commandes Prévues</div>
                      </div>
                    </div>
                    <div className="bg-accent/20 dark:bg-accent/10 rounded-lg p-4 border border-border">
                      <h4 className="font-medium mb-2 text-foreground">Recommandations IA:</h4>
                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {salesForecasts.recommendations || 'Aucune recommandation disponible'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucune prévision disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Top Produits */}
            <Card>
              <CardHeader><CardTitle>Top Produits</CardTitle></CardHeader>
              <CardContent>
                {loadingSales ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (salesMetrics?.topSellingProducts?.length || 0) > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {salesMetrics!.topSellingProducts.slice(0, 6).map((p: any) => (
                      <div key={p.productId} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="text-sm font-medium">{p.title}</div>
                          <div className="text-xs text-gray-600">{p.quantitySold} ventes</div>
                        </div>
                        <div className="text-sm font-semibold">{formatCurrency(p.revenue)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Aucune vente suffisante pour établir un top produits.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Financier */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Analyse Financière IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFinancial ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : financialAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {financialAnalysis.grossMargin?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Marge brute</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {financialAnalysis.conversionRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Taux de conversion</div>
                    </div>
                  </div>
                  <div className="bg-accent/20 dark:bg-accent/10 rounded-lg p-4 border border-border">
                    <h4 className="font-medium mb-2 text-foreground">Recommandations Financières:</h4>
                    <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {financialAnalysis.recommendations?.join('\n') || 'Aucune recommandation disponible'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Analyse en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Inventaire */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Analyse Intelligente des Stocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInventory ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : inventoryAnalysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {inventoryAnalysis.outOfStock?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Ruptures de stock</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">
                        {inventoryAnalysis.lowStock?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Stock faible</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(inventoryAnalysis.totalValue || 0)}
                      </div>
                      <div className="text-sm text-gray-600">Valeur totale</div>
                    </div>
                  </div>
                  {inventoryAnalysis.recommendations && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Actions Recommandées:</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {inventoryAnalysis.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Analyse des stocks en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Détection d'Anomalies IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAnomalies ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : anomalies ? (
                <div className="space-y-4">
                  {anomalies.suspiciousOrders?.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-medium text-red-700">Commandes Suspectes Détectées:</h4>
                      {anomalies.suspiciousOrders.map((order: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Commande #{order.orderNumber}</span>
                            <Badge variant="destructive">Risque: {order.riskScore}/10</Badge>
                          </div>
                          <p className="text-sm text-red-700">{order.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 mx-auto text-green-300 mb-4" />
                      <h3 className="text-lg font-medium text-green-700 mb-2">
                        Aucune anomalie détectée
                      </h3>
                      <p className="text-green-600">Vos transactions semblent normales</p>
                    </div>
                  )}
                  {anomalies.recommendations && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Recommandations de Sécurité:</h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap leading-relaxed">
                        {anomalies.recommendations}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Analyse de sécurité en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparaison multi-canal marketing */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Marketing Multi-Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            {marketingProviders.map((provider) => (
              <label key={provider.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProviders.includes(provider.value)}
                  onChange={e => {
                    setSelectedProviders(prev =>
                      e.target.checked
                        ? [...prev, provider.value]
                        : prev.filter(p => p !== provider.value)
                    );
                  }}
                />
                {provider.label}
              </label>
            ))}
          </div>
          {loadingMarketingComparison ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : marketingComparison && marketingComparison.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Plateforme</th>
                    <th className="px-4 py-2 border">Dépenses</th>
                    <th className="px-4 py-2 border">Revenus</th>
                    <th className="px-4 py-2 border">ROAS</th>
                    <th className="px-4 py-2 border">Clics</th>
                    <th className="px-4 py-2 border">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketingComparison.map((row: any) => (
                    <tr key={row.provider}>
                      <td className="px-4 py-2 border font-medium">{row.providerLabel || row.provider}</td>
                      <td className="px-4 py-2 border">{formatCurrency(row.spend)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(row.revenue)}</td>
                      <td className="px-4 py-2 border">{row.roas?.toFixed(2) ?? '-'}</td>
                      <td className="px-4 py-2 border">{row.clicks ?? '-'}</td>
                      <td className="px-4 py-2 border">{row.conversions ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">Aucune donnée marketing disponible pour la période sélectionnée.</div>
          )}
        </CardContent>
      </Card>

      {/* Graphiques d'analyse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des ventes par période */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChart ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : errorChart ? (
              <div className="text-red-500 text-center py-4">
                {errorChart}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" name="CA" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="orders" name="Commandes" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Graphique répartition des ventes par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : salesMetrics?.salesByCategory ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesMetrics.salesByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {salesMetrics.salesByCategory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique des top produits */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produits</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : salesMetrics?.topSellingProducts ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={salesMetrics.topSellingProducts.slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="revenue" name="CA" fill="#8884d8" />
                  <Bar dataKey="quantitySold" name="Quantité" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique des stocks */}
        <Card>
          <CardHeader>
            <CardTitle>État des stocks</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingInv ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : inventoryMetrics ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'En stock', value: inventoryMetrics.inStockItems || 0 },
                      { name: 'Stock faible', value: inventoryMetrics.lowStockItems || 0 },
                      { name: 'Rupture', value: inventoryMetrics.outOfStockItems || 0 }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                  >
                    {[
                      { name: 'En stock', color: '#4CAF50' },
                      { name: 'Stock faible', color: '#FFC107' },
                      { name: 'Rupture', color: '#F44336' }
                    ].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPIs Inventaire */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader><CardTitle>Produits</CardTitle></CardHeader>
          <CardContent>
            {loadingInv ? (
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{inventoryMetrics?.totalProducts || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Variantes</CardTitle></CardHeader>
          <CardContent>
            {loadingInv ? (
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{inventoryMetrics?.totalVariants || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Valeur Stock</CardTitle></CardHeader>
          <CardContent>
            {loadingInv ? (
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(inventoryMetrics?.totalInventoryValue || 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ruptures / Faible</CardTitle></CardHeader>
          <CardContent>
            {loadingInv ? (
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">
                {(inventoryMetrics?.outOfStockItems || 0)} / {(inventoryMetrics?.lowStockItems || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;