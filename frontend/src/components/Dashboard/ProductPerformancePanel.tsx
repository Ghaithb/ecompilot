import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductMetric {
  productId: string;
  title: string;
  quantitySold: number;
  revenue: number;
  salesPercentage: number;
  revenuePercentage: number;
}

interface ProductAnalytics {
  totalArticlesSold: number;
  uniqueProductsSold: number;
  winningProduct: ProductMetric | null;
  products: ProductMetric[];
}

interface ProductPerformancePanelProps {
  data?: ProductAnalytics;
  formatCurrency: (amount: number) => string;
}

export function ProductPerformancePanel({ data, formatCurrency }: ProductPerformancePanelProps) {
  if (!data) return null;

  const winner = data.winningProduct;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Performance produits
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.totalArticlesSold} articles vendus · {data.uniqueProductsSold} produits distincts
          </p>
        </div>
        <Link to="/analytics?tab=products" className="text-sm text-primary hover:underline">
          Analyse complète →
        </Link>
      </div>

      {winner && (
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <Badge className="mb-2 bg-amber-500">Produit gagnant</Badge>
                <h3 className="text-xl font-bold text-gray-900">{winner.title}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{winner.quantitySold}</p>
                    <p className="text-xs text-muted-foreground">Unités vendues</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{winner.salesPercentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Part des ventes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{formatCurrency(winner.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Chiffre d&apos;affaires</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{winner.revenuePercentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Part du CA</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Répartition des ventes par produit
          </CardTitle>
          <CardDescription>% du volume et du chiffre d&apos;affaires par article</CardDescription>
        </CardHeader>
        <CardContent>
          {data.products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune vente enregistrée</p>
          ) : (
            <div className="space-y-4">
              {data.products.slice(0, 8).map((product, index) => (
                <div key={product.productId} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-5">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span className="text-sm font-medium truncate">{product.title}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-sm">
                      <Badge variant="secondary">{product.quantitySold} u.</Badge>
                      <span className="font-semibold">{product.salesPercentage.toFixed(1)}%</span>
                      <span className="text-muted-foreground hidden sm:inline">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                  <Progress value={product.salesPercentage} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
