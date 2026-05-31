import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, LayoutTemplate, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { applyStoreTemplate } from '@/services/websiteSettingsApi';
import { listTemplates } from '@/templates/storefront/templateRegistry';
import { DEFAULT_STORE_TEMPLATE } from '@/constants/store-templates';

/** Admin / merchant template selector with live preview link */
export default function StoreTemplatePage() {
  const { toast } = useToast();
  const [selected, setSelected] = useState(DEFAULT_STORE_TEMPLATE);
  const [applying, setApplying] = useState<string | null>(null);

  const { data: website, isLoading } = useQuery({
    queryKey: ['website', 'config'],
    queryFn: async () => {
      const res = await api.get('/website/config');
      return res.data as { slug?: string; storeTemplate?: string; name?: string };
    },
  });

  useEffect(() => {
    if (website?.storeTemplate) setSelected(website.storeTemplate);
  }, [website?.storeTemplate]);

  const templates = listTemplates();
  const storeUrl = website?.slug ? `/store/${website.slug}` : null;

  const handleApply = async (templateId: string) => {
    setApplying(templateId);
    try {
      await applyStoreTemplate(templateId);
      setSelected(templateId);
      toast({ title: 'Template appliqué', description: 'La boutique publique est mise à jour.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'appliquer le template', variant: 'destructive' });
    } finally {
      setApplying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6" />
            Templates boutique
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {website?.name || 'Votre boutique'} · 5 layouts COD optimisés Tunisie
          </p>
        </div>
        {storeUrl && (
          <Button variant="outline" asChild>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Aperçu live
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => {
          const active = selected === tpl.id;
          return (
            <Card
              key={tpl.id}
              className={`saas-card saas-card-interactive cursor-pointer ${active ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleApply(tpl.id)}
            >
              <CardHeader className="pb-2">
                <div className="h-24 rounded-xl bg-gradient-to-br from-[var(--store-primary,#2563eb)]/20 to-muted mb-2 flex items-center justify-center text-xs text-muted-foreground">
                  Preview · {tpl.name}
                </div>
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  {tpl.name}
                  {active && <Badge>Actif</Badge>}
                </CardTitle>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  className="w-full"
                  variant={active ? 'secondary' : 'default'}
                  disabled={applying === tpl.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(tpl.id);
                  }}
                >
                  {applying === tpl.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : active ? (
                    'Template actif'
                  ) : (
                    'Appliquer'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="saas-card">
        <CardHeader>
          <CardTitle className="text-base">Architecture</CardTitle>
          <CardDescription>
            Chaque template est un composant React indépendant dans{' '}
            <code className="text-xs">/src/templates/storefront/</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Ajouter un template : créer un fichier + l&apos;enregistrer dans <code>templateRegistry.ts</code>.</p>
          <p>
            Route publique : <code>/store/:slug</code> charge <code>storeTemplate</code> depuis l&apos;API.
          </p>
          <Button variant="link" className="px-0" asChild>
            <Link to="/website/settings">Paramètres avancés boutique</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
