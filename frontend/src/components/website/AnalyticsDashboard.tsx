import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointerClick,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface AnalyticsData {
  pageId: string;
  views: {
    total: number;
    unique: number;
    trend: number;
  };
  engagement: {
    avgTimeOnPage: number;
    bounceRate: number;
    clickThroughRate: number;
  };
  conversions: {
    total: number;
    rate: number;
    value: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    conversions: number;
  }>;
  geography: Array<{
    country: string;
    views: number;
    percentage: number;
  }>;
  traffic Sources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  realTime: {
    activeUsers: number;
    pageViews: number;
  };
}

interface AnalyticsDashboardProps {
  pageId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ pageId }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [pageId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Simuler les données analytics (à remplacer par un vrai appel API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setData({
      pageId,
      views: {
        total: 12547,
        unique: 8932,
        trend: 15.3,
      },
      engagement: {
        avgTimeOnPage: 145, // secondes
        bounceRate: 42.5,
        clickThroughRate: 3.8,
      },
      conversions: {
        total: 342,
        rate: 2.7,
        value: 15840,
      },
      devices: {
        desktop: 45,
        mobile: 42,
        tablet: 13,
      },
      topPages: [
        { path: '/accueil', views: 5234, conversions: 142 },
        { path: '/produits', views: 3891, conversions: 98 },
        { path: '/contact', views: 2156, conversions: 67 },
      ],
      geography: [
        { country: 'France', views: 7856, percentage: 62.6 },
        { country: 'Belgique', views: 1893, percentage: 15.1 },
        { country: 'Suisse', views: 1245, percentage: 9.9 },
        { country: 'Canada', views: 891, percentage: 7.1 },
        { country: 'Autres', views: 662, percentage: 5.3 },
      ],
      trafficSources: [
        { source: 'Recherche Organique', visits: 5628, percentage: 44.8 },
        { source: 'Direct', visits: 3762, percentage: 30.0 },
        { source: 'Réseaux Sociaux', visits: 2134, percentage: 17.0 },
        { source: 'Référents', visits: 1023, percentage: 8.2 },
      ],
      realTime: {
        activeUsers: 127,
        pageViews: 1543,
      },
    });
    
    setLoading(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Analyses détaillées de vos performances
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Dernières 24h</SelectItem>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
            <SelectItem value="1y">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Real-time Stats */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En Ce Moment</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-2xl font-bold">{data.realTime.activeUsers}</span>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-muted-foreground">utilisateurs actifs</div>
              </div>
            </div>
            <Badge className="bg-green-500">Live</Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Vues Totales</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{formatNumber(data.views.total)}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {data.views.trend > 0 ? (
                      <>
                        <ArrowUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-medium">+{data.views.trend}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-3 h-3 text-red-600" />
                        <span className="text-red-600 font-medium">{data.views.trend}%</span>
                      </>
                    )}
                    <span className="text-muted-foreground">vs période précédente</span>
                  </div>
                </div>
              </div>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Avg Time */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Temps Moyen</p>
                <p className="text-2xl font-bold">{formatTime(data.engagement.avgTimeOnPage)}</p>
                <p className="text-xs text-muted-foreground">par visite</p>
              </div>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Conversions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{data.conversions.total}</p>
                <p className="text-xs text-muted-foreground">
                  Taux: {data.conversions.rate}%
                </p>
              </div>
              <Target className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold">{formatCurrency(data.conversions.value)}</p>
                <p className="text-xs text-muted-foreground">générés</p>
              </div>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Trafic</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="geography">Géographie</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pages Populaires</CardTitle>
              <CardDescription>Top des pages les plus visitées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPages.map((page, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{page.path}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatNumber(page.views)} vues
                        </span>
                        <span className="text-green-600 font-medium">
                          {page.conversions} conversions
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(page.views / data.views.total) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MousePointerClick className="w-4 h-4" />
                    Taux de Clic
                  </div>
                  <p className="text-3xl font-bold">{data.engagement.clickThroughRate}%</p>
                  <Progress value={data.engagement.clickThroughRate * 10} className="h-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="w-4 h-4" />
                    Taux de Rebond
                  </div>
                  <p className="text-3xl font-bold">{data.engagement.bounceRate}%</p>
                  <Progress value={data.engagement.bounceRate} className="h-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    Visiteurs Uniques
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(data.views.unique)}</p>
                  <p className="text-xs text-muted-foreground">
                    {((data.views.unique / data.views.total) * 100).toFixed(1)}% du total
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Appareil</CardTitle>
              <CardDescription>Types d'appareils utilisés par vos visiteurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Desktop</span>
                      <span className="text-sm font-medium">{data.devices.desktop}%</span>
                    </div>
                    <Progress value={data.devices.desktop} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Mobile</span>
                      <span className="text-sm font-medium">{data.devices.mobile}%</span>
                    </div>
                    <Progress value={data.devices.mobile} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Tablette</span>
                      <span className="text-sm font-medium">{data.devices.tablet}%</span>
                    </div>
                    <Progress value={data.devices.tablet} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Répartition Géographique</CardTitle>
              <CardDescription>D'où viennent vos visiteurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.geography.map((country, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{country.country}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(country.views)} ({country.percentage}%)
                        </span>
                      </div>
                      <Progress value={country.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Sources de Trafic</CardTitle>
              <CardDescription>Comment les visiteurs arrivent sur votre site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(source.visits)} ({source.percentage}%)
                        </span>
                      </div>
                      <Progress value={source.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
