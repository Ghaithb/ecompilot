import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ExternalLink, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SiteData {
  website: {
    name: string;
    slug: string;
    theme: any;
    subdomain: string;
  };
  page: {
    html: string;
    css: string;
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
}

export function PublicSitePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Slug du site manquant');
      setLoading(false);
      return;
    }

    fetchSite();
  }, [slug]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/v1/public/website/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Site non trouvé. Vérifiez le slug ou générez un nouveau site.');
        } else {
          setError('Erreur lors du chargement du site');
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.website && data.page) {
        setSiteData(data);

        // Mettre à jour le titre de la page
        document.title = data.page.seo?.title || data.website.name;
      } else {
        setError('Données du site invalides');
      }
    } catch (err) {
      console.error('Erreur chargement site:', err);
      setError('Impossible de charger le site. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chargement du site...</h2>
            <p className="text-gray-600 text-center">
              Récupération de <span className="font-semibold text-primary">{slug}.ecompilot</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Site Introuvable</h2>
            <p className="text-gray-600 text-center mb-8 text-lg">
              {error || 'Une erreur est survenue'}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/')} variant="outline" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Retour Accueil
              </Button>
              <Button onClick={fetchSite} size="lg">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Bandeau Admin (visible uniquement en mode preview) */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Preview</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm opacity-90">
                  🌐 <span className="font-mono">{siteData.website.subdomain}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => window.open(`http://${siteData.website.subdomain}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ouvrir dans nouvel onglet</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/website')}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu du site généré */}
      <div className="site-content">
        <style dangerouslySetInnerHTML={{ __html: siteData.page.css }} />
        <div dangerouslySetInnerHTML={{ __html: siteData.page.html }} />
      </div>

      {/* SEO Meta (hidden, just for info) */}
      <div className="hidden">
        <meta name="description" content={siteData.page.seo?.description} />
        <meta name="keywords" content={siteData.page.seo?.keywords?.join(', ')} />
      </div>
    </div>
  );
}
