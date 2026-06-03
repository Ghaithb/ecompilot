import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MessageCircle, Package, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Supplier {
  _id: string;
  name: string;
  category: string;
  city: string;
  whatsapp: string;
  isVerified: boolean;
  rating: number;
  responseRate: string;
}

interface WholesaleProduct {
  _id: string;
  title: string;
  wholesalePrice: number;
  retailPriceEstimate: number;
  stockStatus: string;
  supplierId: Partial<Supplier>;
}

const WholesaleHubPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/wholesale/suppliers'),
      api.get('/wholesale/products')
    ]).then(([sRes, pRes]) => {
      setSuppliers(sRes.data || []);
      setProducts(pRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement du réseau fournisseurs...</div>;

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wholesale Hub</h1>
        <p className="text-muted-foreground mt-2">
          Connectez-vous directement aux meilleurs grossistes tunisiens vérifiés.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 underline decoration-primary underline-offset-8">
          <Truck className="h-5 w-5" /> Annuaire Fournisseurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {suppliers.map((s) => (
            <Card key={s._id} className="relative">
              {s.isVerified && (
                <div className="absolute top-2 right-2 text-primary">
                  <CheckCircle className="h-5 w-5 fill-current text-white" />
                  <Badge className="bg-primary text-[8px] px-1 py-0 h-4 uppercase">Vérifié</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                  <span>📍 {s.city}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Réponse</span>
                  <span className="font-medium text-green-600">{s.responseRate}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2" asChild>
                    <a href={`https://wa.me/${s.whatsapp}`} target="_blank">
                      <MessageCircle className="h-3.5 w-3.5 text-green-500" /> WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 underline decoration-primary underline-offset-8">
          <Package className="h-5 w-5" /> Produits Grossistes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p._id} className="group hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center border-b">
                <Package className="h-10 w-10 text-muted-foreground/50 group-hover:scale-110 transition-transform" />
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <Badge variant={p.stockStatus === 'in_stock' ? 'default' : 'secondary'}>
                    {p.stockStatus === 'in_stock' ? 'En Stock' : 'Limité'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-[10px] text-muted-foreground uppercase">Prix Gros</p>
                    <p className="text-lg font-bold text-primary">{p.wholesalePrice} TND</p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <p className="text-[10px] text-green-600 uppercase">Marge Est.</p>
                    <p className="text-lg font-bold text-green-600">+{p.retailPriceEstimate - p.wholesalePrice} TND</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="w-full gap-2">
                    <Zap className="h-4 w-4" /> Lancer Produit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WholesaleHubPage;
