import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { integrationsApi } from '@/lib/integrationsApi';
import { Facebook, Instagram, Twitter, Linkedin, ShoppingBag, CreditCard, Smartphone, Link2, Unlink, Loader2, Check, AlertCircle } from 'lucide-react';
import TunisiaPaymentsPanel from '@/components/integrations/TunisiaPaymentsPanel';

const IntegrationsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: socialStatus, isLoading: loadingSocial } = useQuery({ queryKey: ['integrations', 'social'], queryFn: integrationsApi.getSocialStatus });
  const { data: stripeStatus, isLoading: loadingStripe } = useQuery({ queryKey: ['integrations', 'stripe'], queryFn: integrationsApi.getStripeStatus });
  const { data: shopifyStatus, isLoading: loadingShopify } = useQuery({ queryKey: ['integrations', 'shopify'], queryFn: integrationsApi.getShopifyStatus });
  
  const disconnectMutation = useMutation({
    mutationFn: async ({ type, platform }: { type: string; platform?: string }) => {
      if (type === 'social' && platform) {
        const fns: any = { facebook: integrationsApi.disconnectFacebook, instagram: integrationsApi.disconnectInstagram, twitter: integrationsApi.disconnectTwitter, linkedin: integrationsApi.disconnectLinkedin };
        return fns[platform]();
      }
      if (type === 'stripe') return integrationsApi.disconnectStripe();
      if (type === 'shopify') return integrationsApi.disconnectShopify();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({ title: 'Déconnecté', description: 'Intégration déconnectée avec succès' });
    },
  });

  const handleConnect = async (platform: string) => {
    try {
      const fns: any = { facebook: integrationsApi.authorizeFacebook, instagram: integrationsApi.authorizeInstagram, twitter: integrationsApi.authorizeTwitter, linkedin: integrationsApi.authorizeLinkedin };
      if (fns[platform]) {
        const { authUrl } = await fns[platform]();
        window.location.href = authUrl;
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de se connecter', variant: 'destructive' });
    }
  };

  if (loadingSocial || loadingStripe || loadingShopify) {
    return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const social = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-500', connected: socialStatus?.facebook?.connected, info: socialStatus?.facebook?.pageName },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', connected: socialStatus?.instagram?.connected, info: socialStatus?.instagram?.username },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-sky-500', connected: socialStatus?.twitter?.connected, info: socialStatus?.twitter?.username },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', connected: socialStatus?.linkedin?.connected, info: socialStatus?.linkedin?.name },
  ];

  return (
    <div className="w-full px-6 py-6 space-y-8">
      <div><h1 className="text-3xl font-bold mb-2">Intégrations</h1><p className="text-gray-600">Connectez vos plateformes</p></div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Réseaux Sociaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {social.map(p => {
            const Icon = p.icon;
            return (
              <Card key={p.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className={p.color + ' p-3 rounded-lg'}><Icon className="w-6 h-6 text-white" /></div><div><CardTitle>{p.name}</CardTitle></div></div>
                    {p.connected ? <Badge><Check className="w-3 h-3" /> Connecté</Badge> : <Badge variant="outline"><AlertCircle className="w-3 h-3" /> Non connecté</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {p.connected && p.info && <p className="text-sm mb-3">Compte: {p.info}</p>}
                  {p.connected ? <Button variant="destructive" size="sm" onClick={() => disconnectMutation.mutate({ type: 'social', platform: p.id })}><Unlink className="w-4 h-4 mr-2" />Déconnecter</Button> : <Button size="sm" onClick={() => handleConnect(p.id)}><Link2 className="w-4 h-4 mr-2" />Connecter</Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">E-commerce</h2>
        <Card><CardHeader><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="bg-green-600 p-3 rounded-lg"><ShoppingBag className="w-6 h-6 text-white" /></div><div><CardTitle>Shopify</CardTitle></div></div>{shopifyStatus?.isConnected ? <Badge><Check className="w-3 h-3" />Connecté</Badge> : <Badge variant="outline">Non connecté</Badge>}</div></CardHeader><CardContent>{shopifyStatus?.isConnected && <p className="text-sm mb-3">Produits: {shopifyStatus.shopifyProducts || 0} | Commandes: {shopifyStatus.shopifyOrders || 0}</p>}{shopifyStatus?.isConnected ? <Button variant="destructive" size="sm" onClick={() => disconnectMutation.mutate({ type: 'shopify' })}><Unlink className="w-4 h-4 mr-2" />Déconnecter</Button> : <Button size="sm"><Link2 className="w-4 h-4 mr-2" />Connecter</Button>}</CardContent></Card>
      </div>
      <TunisiaPaymentsPanel />
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">Paiements internationaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="bg-blue-500 p-3 rounded-lg"><CreditCard className="w-6 h-6 text-white" /></div><div><CardTitle>Stripe</CardTitle></div></div>{stripeStatus?.connected ? <Badge>Actif</Badge> : <Badge variant="outline">Inactif</Badge>}</div></CardHeader><CardContent><p className="text-xs text-gray-500 mb-3">Frais: 2.9% + 0.30€</p>{stripeStatus?.connected ? <Button variant="destructive" size="sm" onClick={() => disconnectMutation.mutate({ type: 'stripe' })}><Unlink className="w-4 h-4 mr-2" />Déconnecter</Button> : <Button size="sm"><Link2 className="w-4 h-4 mr-2" />Connecter</Button>}</CardContent></Card>
          <Card><CardHeader><div className="flex items-center gap-3"><div className="bg-orange-500 p-3 rounded-lg"><Smartphone className="w-6 h-6 text-white" /></div><div><CardTitle>Orange Money</CardTitle><CardDescription>Afrique</CardDescription></div></div></CardHeader><CardContent><p className="text-xs text-gray-500 mb-3">Frais: 1.5% + 100 FCFA</p><Button size="sm" disabled>Prochainement</Button></CardContent></Card>
          <Card><CardHeader><div className="flex items-center gap-3"><div className="bg-yellow-500 p-3 rounded-lg"><Smartphone className="w-6 h-6 text-white" /></div><div><CardTitle>MTN Money</CardTitle><CardDescription>MTN Afrique</CardDescription></div></div></CardHeader><CardContent><p className="text-xs text-gray-500 mb-3">Frais: 1.5% + 50 FCFA</p><Button size="sm" disabled>Prochainement</Button></CardContent></Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;