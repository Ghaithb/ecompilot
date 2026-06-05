import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Globe, Plus, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScrapedData {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  images: string[];
  url: string;
}

export default function ScraperTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScrapedData | null>(null);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/market-intelligence/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ url })
      });
      if (!res.ok) throw new Error('Erreur lors du scraping');
      const json = await res.json();
      setData(json);
      toast({ title: '✅ Scraping réussi', description: 'Données extraites avec succès.' });
    } catch (error) {
      toast({ 
        title: '❌ Erreur', 
        description: 'Impossible de lire cette URL. Vérifiez le lien.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!data) return;
    // Implementation for creating product in merchant shop
    toast({ title: '🚀 Importation...', description: 'Le produit est en cours de création.' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card className="border-2 border-primary/20 shadow-xl overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg text-white">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Magic Scraper</CardTitle>
              <CardDescription>Importez n'importe quel produit en un clic depuis une URL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Collez le lien du produit (Shopify, ou autres...)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 text-lg h-12"
            />
            <Button 
              onClick={handleScrape} 
              disabled={loading || !url}
              className="h-12 px-8 font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {loading ? 'Analyse...' : 'Analyser'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg border-2 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Product Preview */}
              <div className="w-full md:w-1/3 space-y-4">
                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden border">
                  {data.images[0] ? (
                    <img src={data.images[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {data.images.slice(1, 5).map((img, i) => (
                    <img key={i} src={img} className="w-16 h-16 rounded-md object-cover border" alt="Thumb" />
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 leading-tight">{data.title}</h2>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-3xl font-bold text-emerald-600">
                      {data.price ? `${data.price} ${data.currency}` : 'Prix non détecté'}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Import Sourcing
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.description || "Aucune description extraite du site source."}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleImport} className="flex-1 h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200">
                    <Plus className="w-5 h-5 mr-2" /> Ajouter à ma boutique
                  </Button>
                  <Button variant="outline" className="h-14 px-8 border-2 border-slate-200" onClick={() => setData(null)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
