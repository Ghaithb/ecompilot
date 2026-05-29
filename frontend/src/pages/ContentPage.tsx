import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { websiteApi } from '@/lib/websiteApi';
import { FileText, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';

const ContentPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({ queryKey: ['pages'], queryFn: websiteApi.getPages });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => websiteApi.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({ title: 'Supprimé', description: 'Page supprimée avec succès' });
    },
  });

  const getStatusBadge = (status: string) => {
    const cfg: any = { published: { variant: 'default', label: 'Publié' }, draft: { variant: 'secondary', label: 'Brouillon' } };
    const c = cfg[status] || cfg.draft;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (isLoading) return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const publishedPages = pages?.filter((p: any) => p.status === 'published').length || 0;
  const draftPages = pages?.filter((p: any) => p.status === 'draft').length || 0;

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="w-8 h-8" />Gestion de contenu</h1><p className="text-gray-600 mt-2">Gérez vos pages et contenus</p></div><Button><Plus className="w-4 h-4 mr-2" />Nouvelle page</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total pages</p><p className="text-2xl font-bold">{pages?.length || 0}</p></div><FileText className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Publiées</p><p className="text-2xl font-bold">{publishedPages}</p></div><Eye className="w-8 h-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Brouillons</p><p className="text-2xl font-bold">{draftPages}</p></div><Edit className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Vos pages</CardTitle><CardDescription>{pages?.length || 0} page(s)</CardDescription></CardHeader>
        <CardContent>
          {(!pages || pages.length === 0) ? <div className="text-center py-12"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune page</p></div> : (
            <div className="space-y-4">
              {pages.map((p: any) => (
                <div key={p._id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{p.title}</h3>
                        {getStatusBadge(p.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Slug: /{p.slug}</p>
                      {p.metaDescription && <p className="text-sm text-gray-500 line-clamp-2">{p.metaDescription}</p>}
                      <p className="text-xs text-gray-400 mt-2">Dernière modification: {new Date(p.updatedAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-2" />Voir</Button>
                      <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-2" />Modifier</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(p._id)} disabled={deleteMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPage;