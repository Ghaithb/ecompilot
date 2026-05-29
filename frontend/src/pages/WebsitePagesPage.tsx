import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Home,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WebsitePagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<any>(null);

  useEffect(() => {
    fetchWebsite();
    fetchPages();
  }, []);

  const fetchWebsite = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/v1/website', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWebsite(data);
      } else if (response.status === 404) {
        // Pas de site, c'est normal
        setWebsite(null);
      }
    } catch (error) {
      console.error('Erreur chargement site:', error);
    }
  };

  const handleCreateWebsite = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/v1/website', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Mon Site',
          slug: `site-${Date.now()}`,
        }),
      });

      if (!response.ok) throw new Error('Erreur création site');

      toast({
        title: 'Succès',
        description: 'Site web créé avec succès',
      });

      fetchWebsite();
      fetchPages();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/v1/website/pages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur chargement pages');

      const data = await response.json();
      setPages(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    navigate('/website/builder/new');
  };

  const handleEditPage = (pageId: string) => {
    navigate(`/website/builder/${pageId}`);
  };

  const handleDuplicatePage = async (pageId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3001/api/v1/website/pages/${pageId}/duplicate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Erreur duplication');

      toast({
        title: 'Succès',
        description: 'Page dupliquée avec succès',
      });

      fetchPages();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (pageId: string, isPublished: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const action = isPublished ? 'unpublish' : 'publish';
      const response = await fetch(
        `http://localhost:3001/api/v1/website/pages/${pageId}/${action}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Erreur publication');

      toast({
        title: 'Succès',
        description: isPublished ? 'Page dépubliée' : 'Page publiée',
      });

      fetchPages();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://localhost:3001/api/v1/website/pages/${pageId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Erreur suppression');

      toast({
        title: 'Succès',
        description: 'Page supprimée avec succès',
      });

      fetchPages();
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Mes Pages</h1>
            <p className="text-muted-foreground">
              Gérez les pages de votre site web
            </p>
          </div>
          <Button onClick={handleCreatePage}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Page
          </Button>
        </div>

        {website ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{website.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {website.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={website.published ? 'default' : 'secondary'}>
                    {website.published ? 'Publié' : 'Brouillon'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/website/settings')}
                  >
                    Paramètres
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Créez votre site web</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre site web pour pouvoir ajouter des pages
              </p>
              <Button onClick={handleCreateWebsite}>
                <Plus className="w-4 h-4 mr-2" />
                Créer mon site
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pages List */}
      <div className="grid gap-4">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Aucune page créée pour le moment
              </p>
              <Button onClick={handleCreatePage}>
                <Plus className="w-4 h-4 mr-2" />
                Créer ma première page
              </Button>
            </CardContent>
          </Card>
        ) : (
          pages.map((page) => (
            <Card key={page._id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {page.isHomePage && (
                      <Home className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {page.name}
                        {page.isHomePage && (
                          <Badge variant="outline" className="text-xs">
                            Accueil
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {page.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={page.published ? 'default' : 'secondary'}>
                      {page.published ? 'Publié' : 'Brouillon'}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                      {page.views || 0} vues
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPage(page._id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Éditer
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleTogglePublish(page._id, page.published)
                          }
                        >
                          {page.published ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Dépublier
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Publier
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicatePage(page._id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        {!page.isHomePage && (
                          <DropdownMenuItem
                            onClick={() => handleDeletePage(page._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WebsitePagesPage;
