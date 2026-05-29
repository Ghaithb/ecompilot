import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Smartphone, 
  Monitor,
  Settings,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface SitePreviewData {
  website: {
    _id: string;
    name: string;
    slug: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      font: string;
    };
    status: 'draft' | 'published';
  };
  homePage: {
    _id: string;
    name: string;
    html: string;
    css: string;
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
  stats: {
    totalPages: number;
    totalProducts: number;
    lastUpdated: string;
  };
}

const SitePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState<SitePreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    // Toujours récupérer les données fraîches depuis l'API
    fetchCurrentWebsite();
  }, []);

  const fetchCurrentWebsite = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Récupérer le site actuel du tenant
      const response = await fetch('http://localhost:3001/api/v1/website', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Pas de site, rediriger vers le dashboard
          navigate('/dashboard');
          return;
        }
        throw new Error('Erreur lors de la récupération du site');
      }

      const websiteData = await response.json();
      
      // Récupérer la page d'accueil
      const pagesResponse = await fetch('http://localhost:3001/api/v1/website/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let homePage = null;
      if (pagesResponse.ok) {
        const pages = await pagesResponse.json();
        homePage = pages.find((p: any) => p.isHomePage) || pages[0];
      }

      setPreviewData({
        website: {
          _id: websiteData._id,
          name: websiteData.name,
          slug: websiteData.slug,
          theme: websiteData.theme || {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            font: 'Inter',
          },
          status: websiteData.published ? 'published' : 'draft',
        },
        homePage: homePage || {
          _id: '',
          name: 'Accueil',
          html: '<h1>Site en construction</h1>',
          css: '',
          seo: {
            title: websiteData.name,
            description: '',
            keywords: [],
          },
        },
        stats: {
          totalPages: websiteData.pages?.length || 0,
          totalProducts: 0,
          lastUpdated: websiteData.updatedAt || new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Erreur chargement site:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard', { 
      state: { 
        fromPreview: true,
        siteData: previewData 
      } 
    });
  };

  const handleEditSite = () => {
    if (previewData?.homePage._id) {
      navigate(`/website/builder/${previewData.homePage._id}`);
    }
  };

  const handleViewLiveSite = () => {
    if (previewData?.website.slug) {
      window.open(`/store/${previewData.website.slug}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre site...</p>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Site non trouvé</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/website')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">Prévisualisation de votre site</h1>
                <p className="text-sm text-muted-foreground">{previewData.website.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={previewData.website.status === 'published' ? 'default' : 'secondary'}>
                {previewData.website.status === 'published' ? 'Publié' : 'Brouillon'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleEditSite}>
                <Settings className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Informations et actions */}
          <div className="space-y-6">
            {/* Félicitations */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-5 h-5" />
                  Site généré avec succès !
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-4">
                  Votre site web professionnel est prêt. Vous pouvez maintenant le personnaliser et le publier.
                </p>
                <div className="space-y-2 text-xs text-green-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Design responsive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Optimisé SEO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Performance optimale</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques du site */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pages</span>
                  <span className="font-medium">{previewData.stats?.totalPages || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Produits</span>
                  <span className="font-medium">{previewData.stats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dernière MAJ</span>
                  <span className="font-medium text-xs">
                    {previewData.stats?.lastUpdated 
                      ? new Date(previewData.stats.lastUpdated).toLocaleDateString('fr-FR')
                      : new Date().toLocaleDateString('fr-FR')
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleEditSite}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Modifier le design
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleViewLiveSite}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir le site public
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/website/settings')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Paramètres du site
                </Button>
              </CardContent>
            </Card>

            {/* Bouton principal */}
            <Button 
              onClick={handleGoToDashboard}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Accéder au Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Zone de prévisualisation */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aperçu de votre site</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div 
                    className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${
                      previewMode === 'desktop' ? 'w-full' :
                      previewMode === 'tablet' ? 'w-full max-w-2xl' :
                      'w-full max-w-sm'
                    }`}
                    style={{ height: '800px' }}
                  >
                    {/* Afficher le HTML complet dans un iframe pour isoler le CSS et JS */}
                    <iframe
                      srcDoc={previewData.homePage.html}
                      className="w-full h-full border-0 rounded"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title="Site Preview"
                    />
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aperçu en mode {previewMode === 'desktop' ? 'desktop' : previewMode === 'tablet' ? 'tablette' : 'mobile'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePreviewPage;

