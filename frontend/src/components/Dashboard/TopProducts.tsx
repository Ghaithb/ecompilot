import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';

interface TopProduct {
  productId: string;
  title?: string;
  name?: string;
  quantitySold?: number;
  sales?: number;
  revenue: number;
  salesPercentage?: number;
  growthPercentage?: number;
}

export function TopProducts() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 60_000,
  });

  const topProducts = (dashboard?.productAnalytics?.products || dashboard?.sales?.topSellingProducts || []) as TopProduct[];
  const totalSales = topProducts.reduce((sum: number, p: TopProduct) => sum + (p.quantitySold || p.sales || 0), 0);

  // Emojis par défaut pour les produits
  const getProductEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('parfum')) return '🌸';
    if (lowerName.includes('rose')) return '🌹';
    if (lowerName.includes('cologne')) return '💧';
    if (lowerName.includes('vanille')) return '🌺';
    if (lowerName.includes('jasmin')) return '🌼';
    if (lowerName.includes('café') || lowerName.includes('coffee')) return '☕';
    if (lowerName.includes('sandwich')) return '🥪';
    return '📦';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <CardTitle>Top Produits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!topProducts.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <CardTitle>Top Produits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">Aucun produit vendu</p>
          <p className="text-xs text-gray-400 mt-1">Les produits apparaîtront ici après vos premières ventes</p>
        </CardContent>
      </Card>
    );
  }

  // Trouver le max pour calculer le pourcentage de la barre de progression
  const maxRevenue = Math.max(...topProducts.map((p: TopProduct) => p.revenue || 0));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <CardTitle>Top Produits</CardTitle>
          </div>
          <Badge variant="secondary">Ce mois</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product: TopProduct, index: number) => {
            const progress = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
            const trend = product.growthPercentage || 0;
            const trendFormatted = trend >= 0 ? `+${trend}%` : `${trend}%`;
            
            return (
              <div key={product.productId || index} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-2xl">
                    {getProductEmoji(product.title || product.name || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title || product.name}
                      </p>
                      <span className="text-sm font-bold text-gray-900 ml-2">
                        {product.salesPercentage?.toFixed(0) ?? 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {product.quantitySold ?? product.sales ?? 0} vente{(product.quantitySold ?? product.sales ?? 0) > 1 ? 's' : ''}
                      </span>
                      {trend !== 0 && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                          {trendFormatted}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total des ventes</span>
            <span className="font-bold text-gray-900">{totalSales} produit{totalSales > 1 ? 's' : ''} vendu{totalSales > 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
