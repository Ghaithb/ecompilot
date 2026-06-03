import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Truck, MapPin, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProductInsight {
  title: string;
  category: string;
  trendScore: number;
  deliveryScore: number;
  salesCount: number;
  averagePrice: number;
  topRegions: { name: string; count: number }[];
  metadata?: {
    bestCarrier: string;
    bestCarrierRate: number;
  };
}

const MarketIntelligencePage = () => {
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/market-intelligence/dashboard')
      .then(res => {
        setInsights(res.data.winningProducts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Chargement de l'intelligence marché...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market Intelligence Center</h1>
        <p className="text-muted-foreground mt-2">
          Analyse en temps réel du marché tunisien : produits gagnants, tendances et logistique.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((product, i) => (
          <Card key={i} className="overflow-hidden border-2 hover:border-primary/50 transition-all">
            <CardHeader className="bg-muted/50 pb-4">
              <div className="flex justify-between items-start">
                <Badge variant="outline">{product.category}</Badge>
                <div className="flex items-center gap-1 text-primary animate-pulse">
                  <Zap className="h-4 w-4 fill-primary" />
                  <span className="font-bold">{product.trendScore}</span>
                </div>
              </div>
              <CardTitle className="mt-2 text-xl">{product.title}</CardTitle>
              <CardDescription>
                Prix marché moyen : <span className="font-semibold text-foreground">{product.averagePrice} TND</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Delivery Intelligence */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Fiabilité Livraison</span>
                  <span className="font-bold">{product.deliveryScore}%</span>
                </div>
                <Progress value={product.deliveryScore} className="h-2" />
                {product.metadata?.bestCarrier && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Conseillé : <span className="text-primary font-medium">{product.metadata.bestCarrier}</span> ({Math.round(product.metadata.bestCarrierRate)}% succès)
                  </p>
                )}
              </div>

              {/* Regions Heatmap (Simplified for Card) */}
              <div className="space-y-2">
                <span className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Top Régions</span>
                <div className="flex flex-wrap gap-2">
                  {product.topRegions.slice(0, 3).map((reg, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {reg.name} ({reg.count})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" /> Trouver Fournisseur
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarketIntelligencePage;
