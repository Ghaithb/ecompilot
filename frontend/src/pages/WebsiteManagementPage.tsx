import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';
import {
  Plus, 
  Globe, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  Sparkles,
  FileText,
  Settings
} from 'lucide-react';

const WebsiteManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Récupérer les sites
      const websiteResponse = await fetch(apiUrl('/website'), {
        headers: getAuthHeaders(),
      });

      if (websiteResponse.ok) {
        const websiteData = await websiteResponse.json();
        setWebsites([websiteData]);
      }

      // Récupérer les pages
      const pagesResponse = await fetch(apiUrl('/website/pages'), {
        headers: getAuthHeaders(),
      });

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        setPages(pagesData);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/website/pages/${pageId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Page supprimée avec succès',
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePublishPage = async (pageId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = currentStatus ? 'unpublish' : 'publish';
      
      const response = await fetch(apiUrl(`/website/pages/${pageId}/${endpoint}`), {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: currentStatus ? 'Page dépubliée' : 'Page publiée',
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Gestion de Site Web</h1>
        <p className="text-muted-foreground text-lg">
          Créez et gérez vos sites web professionnels en quelques clics
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => navigate('/website/templates')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Créer un Nouveau Site</h3>
                <p className="text-muted-foreground">
                  Choisissez un template et créez votre site en 30 secondes ⚡
                </p>
              </div>
              <Button size="lg">
                Commencer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/website/builder/new')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Edit className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Page Vierge</h3>
                <p className="text-muted-foreground">
                  Créez une page depuis zéro avec l'éditeur visuel
                </p>
              </div>
              <Button variant="outline" size="lg">
                Créer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Info */}
      {websites.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  {websites[0].name}
                </CardTitle>
                <CardDescription className="mt-2">
                  {websites[0].slug} • {websites[0].published ? '✅ Publié' : '⚠️ Brouillon'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {websites[0].published && (
                  <Button variant="outline" size="sm" onClick={() => window.open(`/${websites[0].slug}`, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir le site
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate('/website/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{pages.length}</div>
                <div className="text-sm text-muted-foreground">Pages totales</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {pages.filter(p => p.published).length}
                </div>
                <div className="text-sm text-muted-foreground">Pages publiées</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {pages.reduce((sum, p) => sum + (p.views || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Vues totales</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {websites[0].theme?.primaryColor || '#3B82F6'}
                </div>
                <div className="text-sm text-muted-foreground">Couleur principale</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pages List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes Pages</CardTitle>
            <Button onClick={() => navigate('/website/builder/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucune page</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première page
              </p>
              <Button onClick={() => navigate('/website/templates')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Choisir un template
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pages.map((page) => (
                <div
                  key={page._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-2 h-12 rounded ${page.published ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{page.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {page.slug} • {page.views || 0} vues
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/preview${page.slug}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/website/builder/${page._id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePublishPage(page._id, page.published)}
                    >
                      {page.published ? '📤' : '📥'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePage(page._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">💡 Besoin d'aide ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🚀 Guide de démarrage</h4>
              <p className="text-sm text-muted-foreground">
                Apprenez à créer votre premier site en 5 minutes
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎨 Templates disponibles</h4>
              <p className="text-sm text-muted-foreground">
                Parfum, Café, Sandwich, Immobilier, E-commerce
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✨ Fonctionnalités</h4>
              <p className="text-sm text-muted-foreground">
                SEO, Responsive, Analytics, E-commerce intégré
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteManagementPage;
