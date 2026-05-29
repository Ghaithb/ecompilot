import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Code,
  Wifi,
  HardDrive,
  Smartphone,
  Gauge,
} from 'lucide-react';

interface PerformanceMetrics {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  metrics: {
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    cls: number; // Cumulative Layout Shift
    fid: number; // First Input Delay
    ttfb: number; // Time to First Byte
    tti: number; // Time to Interactive
  };
  resources: {
    totalSize: number;
    requests: number;
    images: number;
    scripts: number;
    styles: number;
    fonts: number;
  };
  optimization: {
    imageOptimization: number;
    minification: boolean;
    compression: boolean;
    caching: boolean;
    lazyLoading: boolean;
  };
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    impact: string;
    fix: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    savings: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
}

interface PerformanceMonitorProps {
  pageId: string;
  pageUrl?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ pageId, pageUrl }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    analyzePerformance();
  }, [pageId]);

  const analyzePerformance = async () => {
    setLoading(true);
    setAnalyzing(true);

    // Simuler l'analyse de performance
    await new Promise(resolve => setTimeout(resolve, 2000));

    setMetrics({
      overall: {
        score: 87,
        grade: 'B',
      },
      metrics: {
        fcp: 1.2,
        lcp: 2.1,
        cls: 0.05,
        fid: 45,
        ttfb: 0.4,
        tti: 3.2,
      },
      resources: {
        totalSize: 2.4, // MB
        requests: 42,
        images: 18,
        scripts: 8,
        styles: 4,
        fonts: 3,
      },
      optimization: {
        imageOptimization: 67,
        minification: true,
        compression: true,
        caching: false,
        lazyLoading: false,
      },
      issues: [
        {
          severity: 'critical',
          category: 'Images',
          message: 'Images non optimisées détectées',
          impact: 'Temps de chargement +2.3s',
          fix: 'Compresser et convertir en WebP',
        },
        {
          severity: 'warning',
          category: 'JavaScript',
          message: 'Scripts bloquant le rendu',
          impact: 'Délai rendu initial +0.8s',
          fix: 'Charger les scripts en async/defer',
        },
        {
          severity: 'warning',
          category: 'Cache',
          message: 'Cache navigateur non configuré',
          impact: 'Visites répétées plus lentes',
          fix: 'Configurer les headers Cache-Control',
        },
        {
          severity: 'info',
          category: 'Fonts',
          message: 'Police personnalisée détectée',
          impact: 'Flash de texte invisible',
          fix: 'Utiliser font-display: swap',
        },
      ],
      recommendations: [
        {
          title: 'Activer le Lazy Loading des images',
          description: 'Charger les images uniquement quand elles sont visibles',
          savings: '~1.2s de temps de chargement',
          difficulty: 'easy',
        },
        {
          title: 'Optimiser les images',
          description: 'Compresser et convertir en formats modernes (WebP, AVIF)',
          savings: '~35% de réduction de taille',
          difficulty: 'easy',
        },
        {
          title: 'Implémenter un CDN',
          description: 'Distribuer les ressources via un réseau de distribution',
          savings: '~40% de temps de réponse serveur',
          difficulty: 'medium',
        },
        {
          title: 'Code Splitting',
          description: 'Diviser le JavaScript en morceaux plus petits',
          savings: '~25% de JavaScript initial',
          difficulty: 'hard',
        },
      ],
    });

    setLoading(false);
    setAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-500';
    if (grade === 'B') return 'bg-blue-500';
    if (grade === 'C') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-orange-100 text-orange-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !metrics) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyse de performance en cours...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Évaluation de la vitesse, optimisations, et ressources
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(metrics.overall.score)}`}>
                      {metrics.overall.score}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white font-bold ${getGradeColor(metrics.overall.grade)}`}>
                  {metrics.overall.grade}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Performance Score</h3>
                <p className="text-muted-foreground">
                  {metrics.overall.score >= 90 && 'Excellente performance ! 🎉'}
                  {metrics.overall.score >= 70 && metrics.overall.score < 90 && 'Bonne performance, quelques améliorations possibles'}
                  {metrics.overall.score < 70 && 'Performance à améliorer'}
                </p>
                <div className="flex items-center gap-2">
                  <Button onClick={analyzePerformance} disabled={analyzing} size="sm">
                    <Gauge className="w-4 h-4 mr-2" />
                    {analyzing ? 'Analyse...' : 'Re-analyser'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-sm text-muted-foreground">Dernière analyse</div>
              <div className="text-sm font-medium">Il y a quelques instants</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>Métriques clés de l'expérience utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LCP */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">LCP</span>
              </div>
              <div className="text-2xl font-bold mb-1">{metrics.metrics.lcp}s</div>
              <Progress value={Math.min((2.5 / metrics.metrics.lcp) * 100, 100)} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.metrics.lcp <= 2.5 ? '✓ Bon' : metrics.metrics.lcp <= 4 ? '⚠ À améliorer' : '✗ Faible'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Objectif: &lt; 2.5s</div>
            </div>

            {/* FID */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">FID</span>
              </div>
              <div className="text-2xl font-bold mb-1">{metrics.metrics.fid}ms</div>
              <Progress value={Math.min((100 / metrics.metrics.fid) * 100, 100)} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.metrics.fid <= 100 ? '✓ Bon' : metrics.metrics.fid <= 300 ? '⚠ À améliorer' : '✗ Faible'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Objectif: &lt; 100ms</div>
            </div>

            {/* CLS */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">CLS</span>
              </div>
              <div className="text-2xl font-bold mb-1">{metrics.metrics.cls}</div>
              <Progress value={Math.min((0.1 / metrics.metrics.cls) * 100, 100)} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.metrics.cls <= 0.1 ? '✓ Bon' : metrics.metrics.cls <= 0.25 ? '⚠ À améliorer' : '✗ Faible'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Objectif: &lt; 0.1</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">FCP</div>
              <div className="text-lg font-bold">{metrics.metrics.fcp}s</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">TTFB</div>
              <div className="text-lg font-bold">{metrics.metrics.ttfb}s</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">TTI</div>
              <div className="text-lg font-bold">{metrics.metrics.tti}s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues">Problèmes ({metrics.issues.length})</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-3">
          {metrics.issues.map((issue, index) => (
            <Card key={index} className={
              issue.severity === 'critical' ? 'border-red-200 bg-red-50/50' :
              issue.severity === 'warning' ? 'border-orange-200 bg-orange-50/50' :
              'border-blue-200 bg-blue-50/50'
            }>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{issue.message}</h4>
                      <Badge variant="outline" className="text-xs">
                        {issue.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Impact: {issue.impact}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Solution:</span>
                      <span>{issue.fix}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taille Totale</span>
                    <span className="text-2xl font-bold">{metrics.resources.totalSize} MB</span>
                  </div>
                  <Progress value={(metrics.resources.totalSize / 5) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Recommandé: &lt; 3 MB</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Requêtes HTTP</span>
                    <span className="text-2xl font-bold">{metrics.resources.requests}</span>
                  </div>
                  <Progress value={(metrics.resources.requests / 100) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Recommandé: &lt; 50</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{metrics.resources.images} fichiers</span>
                    <Badge variant={metrics.optimization.imageOptimization < 50 ? 'destructive' : 'secondary'}>
                      {metrics.optimization.imageOptimization}% optimisé
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    <span>JavaScript</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{metrics.resources.scripts} fichiers</span>
                    {metrics.optimization.minification ? (
                      <Badge className="bg-green-500">Minifié</Badge>
                    ) : (
                      <Badge variant="destructive">Non minifié</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span>Compression</span>
                  </div>
                  {metrics.optimization.compression ? (
                    <Badge className="bg-green-500">Activée (Gzip/Brotli)</Badge>
                  ) : (
                    <Badge variant="destructive">Désactivée</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-orange-600" />
                    <span>Cache Navigateur</span>
                  </div>
                  {metrics.optimization.caching ? (
                    <Badge className="bg-green-500">Configuré</Badge>
                  ) : (
                    <Badge variant="destructive">Non configuré</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-3">
          {metrics.recommendations.map((rec, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge className={getDifficultyBadge(rec.difficulty)}>
                        {rec.difficulty === 'easy' && '🟢 Facile'}
                        {rec.difficulty === 'medium' && '🟡 Moyen'}
                        {rec.difficulty === 'hard' && '🔴 Difficile'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      Gain estimé: {rec.savings}
                    </div>
                  </div>
                  <Button size="sm">Appliquer</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;
