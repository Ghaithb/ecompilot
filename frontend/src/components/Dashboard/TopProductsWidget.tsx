import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/analyticsApi';
import { useCurrency } from '@/contexts/CurrencyContext';
import { TrendingUp, Package } from 'lucide-react';

interface TopProductsWidgetProps {
  limit?: number;
}

export function TopProductsWidget({ limit = 5 }: TopProductsWidgetProps) {
  const { formatPrice } = useCurrency();
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: () => analyticsApi.getTopProducts(limit),
    staleTime: 60_000,
  });

  const topProducts = data?.topProducts || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top {limit} Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top {limit} Produits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune vente enregistrée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...topProducts.map((p: any) => p.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top {limit} Produits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product: any, index: number) => {
            const percentage = (product.revenue / maxRevenue) * 100;
            const medalEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

            return (
              <div key={product.productId} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">{medalEmoji || `${index + 1}.`}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {product.quantitySold} vendus · {product.salesPercentage?.toFixed(0) ?? 0}%
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatPrice(product.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
