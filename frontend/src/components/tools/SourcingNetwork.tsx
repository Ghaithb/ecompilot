import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Rocket, ShieldCheck, MapPin, Package } from 'lucide-react';
import { formatTND } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface WholesaleProduct {
  _id: string;
  title: string;
  description: string;
  wholesalePrice: number;
  retailPriceEstimate: number;
  image?: string;
  category: string;
  supplierId: {
    name: string;
    city: string;
    isVerified: boolean;
  };
}

export default function SourcingNetwork() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<WholesaleProduct[]>({
    queryKey: ['wholesale-products'],
    queryFn: async () => {
      const res = await api.get('/wholesale/products');
      return res.data;
    }
  });

  const launchMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post(`/wholesale/products/${productId}/launch`);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: '🚀 Produit lancé !', description: 'Le produit a été ajouté à votre inventaire en brouillon.' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-bold tracking-tight">🤝 Market Network</h2>
          <p className="text-muted-foreground">Trouvez des pépites chez nos grossistes partenaires en Tunisie.</p>
          <div className="relative max-w-sm mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un produit ou fournisseur..." 
              className="pl-9 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-8 bg-emerald-50 text-emerald-700 border-emerald-200">
            <ShieldCheck className="w-3 h-3 mr-1" /> Grossistes Vérifiés
          </Badge>
          <Badge variant="outline" className="h-8 bg-blue-50 text-blue-700 border-blue-200">
            <Package className="w-3 h-3 mr-1" /> Stocks Disponibles
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-slate-100" />
              <CardHeader className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </CardHeader>
            </Card>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product._id} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden border-2">
              <div className="relative aspect-video bg-slate-50 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-slate-900 backdrop-blur-md border-slate-200">
                    {product.category}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-5">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {product.title}
                  </CardTitle>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <MapPin className="w-3 h-3 mr-1" /> {product.supplierId.city} • {product.supplierId.name}
                  {product.supplierId.isVerified && <ShieldCheck className="w-3 h-3 ml-1 text-blue-500" />}
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prix Grossiste</p>
                    <p className="text-xl font-black text-slate-900">{formatTND(product.wholesalePrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Vente Estimée</p>
                    <p className="text-lg font-bold text-emerald-600">{formatTND(product.retailPriceEstimate)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <div className="flex-1">
                    <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded inline-flex items-center">
                       Marge: ~{Math.round((product.retailPriceEstimate - product.wholesalePrice) / product.retailPriceEstimate * 100)}%
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button 
                  className="w-full font-bold h-11" 
                  variant="default"
                  onClick={() => launchMutation.mutate(product._id)}
                  disabled={launchMutation.isPending}
                >
                  <Rocket className="w-4 h-4 mr-2" /> 
                  Lancer ce produit
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Search className="w-12 h-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">Essayez d'autres mots-clés ou parcourez nos catégories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
