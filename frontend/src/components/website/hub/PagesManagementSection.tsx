import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Eye, Search, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface Page {
  _id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  order: number;
  updatedAt: string;
}

const PagesManagementSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/website/pages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(response.data);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les pages',
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

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/website/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: 'Succès',
        description: 'Page supprimée avec succès',
      });
      
      loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la page',
        variant: 'destructive',
      });
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chargement des pages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Pages</CardTitle>
              <CardDescription>
                Créez, modifiez et organisez les pages de votre site web
              </CardDescription>
            </div>
            <Button onClick={handleCreatePage}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher une page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Aucune page trouvée' : 'Aucune page créée'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreatePage}>
                <Plus className="w-4 h-4 mr-2" />
                Créer votre première page
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPages.map((page) => (
            <Card key={page._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{page.title}</h3>
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                          {page.status === 'published' ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Modifié le {new Date(page.updatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/store/${page.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPage(page._id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePage(page._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PagesManagementSection;
