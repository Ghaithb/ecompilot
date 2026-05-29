import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ExternalLink,
  Loader2,
  Package,
  Sparkles,
  Store,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  fetchMyWebsite,
  generateQuickBoutique,
  refreshStoreHtml,
  type WebsiteSummary,
} from '@/services/websiteService';

const SimpleBoutiquePanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [website, setWebsite] = useState<WebsiteSummary | null>(null);
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const defaults = {
      shopName: user?.companyName || user?.tenant?.name || '',
      phone: '',
    };
    setShopName(defaults.shopName);
    setPhone(defaults.phone);

    fetchMyWebsite()
      .then(setWebsite)
      .catch(() => setWebsite(null))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    const name = shopName.trim();
    if (name.length < 2) {
      toast({
        title: 'Nom requis',
        description: 'Indiquez le nom de votre boutique (2 caractères minimum).',
        variant: 'destructive',
      });
      return;
    }
    if (!user?.email) {
      toast({
        title: 'Session invalide',
        description: 'Reconnectez-vous pour créer votre boutique.',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateQuickBoutique({
        shopName: name,
        email: user.email,
        phone: phone.trim() || undefined,
        city: 'Tunis',
      });
      const created: WebsiteSummary = {
        _id: result._id || '',
        slug: result.slug || '',
        name: result.name || name,
        published: true,
      };
      setWebsite(created);
      toast({
        title: 'Boutique créée',
        description: 'Votre page de vente COD est en ligne. Ajoutez vos produits pour commencer.',
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Impossible de créer la boutique';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshStoreHtml(phone.trim() || undefined);
      toast({
        title: 'Boutique mise à jour',
        description: 'Checkout et produits synchronisés sur votre page publique.',
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Impossible de mettre à jour la boutique';
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (website?.slug) {
    const storeUrl = `/store/${website.slug}`;
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="w-6 h-6" />
              Votre boutique est en ligne
            </CardTitle>
            <CardDescription>
              Checkout COD, WhatsApp et vos produits — prêt à partager sur TikTok / Instagram.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Lien public :{' '}
              <code className="bg-muted px-2 py-1 rounded text-foreground">{storeUrl}</code>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir ma boutique
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/products">
                  <Package className="w-4 h-4 mr-2" />
                  Gérer mes produits
                </Link>
              </Button>
              <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Mettre à jour la page
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Besoin de modifier le design ?</CardTitle>
            <CardDescription>
              La plupart des vendeurs n&apos;en ont pas besoin — concentrez-vous sur les produits et la conversion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/website/settings">Paramètres avancés (couleurs, SEO…)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Créer ma boutique COD</CardTitle>
          <CardDescription className="text-base">
            2 champs, 1 clic — page de vente avec paiement à la livraison et bouton WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="shopName">Nom de la boutique *</Label>
            <Input
              id="shopName"
              placeholder="Ex. Ma Boutique Mode"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp (optionnel)
            </Label>
            <Input
              id="phone"
              placeholder="+216 XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Pour le bouton contact sur la page — le reste est généré automatiquement.
            </p>
          </div>

          <ul className="text-sm text-muted-foreground space-y-1 border rounded-lg p-4 bg-muted/30">
            <li className="flex gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Page checkout express Tunisie (24 gouvernorats)
            </li>
            <li className="flex gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Vos produits ajoutés dans EcomPilot apparaissent sur la boutique
            </li>
            <li className="flex gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              Aucun choix de template ni questionnaire long
            </li>
          </ul>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCreate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Création en cours…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Créer ma boutique maintenant
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Email du compte : {user?.email}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleBoutiquePanel;
