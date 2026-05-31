import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { integrationsApi } from '@/lib/integrationsApi';
import { whatsappService } from '@/services/whatsappService';
import { IntegrationStatusBadge } from '@/components/integrations/IntegrationStatusBadge';
import TunisiaPaymentsPanel from '@/components/integrations/TunisiaPaymentsPanel';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Link2,
  Unlink,
  Loader2,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

const IntegrationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialStatus, isLoading: loadingSocial } = useQuery({
    queryKey: ['integrations', 'social'],
    queryFn: integrationsApi.getSocialStatus,
  });
  const { data: stripeStatus, isLoading: loadingStripe } = useQuery({
    queryKey: ['integrations', 'stripe'],
    queryFn: integrationsApi.getStripeStatus,
  });
  const { data: shopifyStatus, isLoading: loadingShopify } = useQuery({
    queryKey: ['integrations', 'shopify'],
    queryFn: integrationsApi.getShopifyStatus,
  });
  const { data: whatsappConfig } = useQuery({
    queryKey: ['integrations', 'whatsapp-config'],
    queryFn: whatsappService.checkConfiguration,
  });
  const { data: messagingStatus } = useQuery({
    queryKey: ['integrations', 'messaging-status'],
    queryFn: integrationsApi.getMessagingStatus,
  });

  const disconnectMutation = useMutation({
    mutationFn: async ({ type, platform }: { type: string; platform?: string }) => {
      if (type === 'social' && platform) {
        const fns: Record<string, () => Promise<unknown>> = {
          facebook: integrationsApi.disconnectFacebook,
          instagram: integrationsApi.disconnectInstagram,
          twitter: integrationsApi.disconnectTwitter,
          linkedin: integrationsApi.disconnectLinkedin,
        };
        return fns[platform]();
      }
      if (type === 'stripe') return integrationsApi.disconnectStripe();
      if (type === 'shopify') return integrationsApi.disconnectShopify();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({ title: t('integrations.disconnect'), description: t('integrations.disconnect') });
    },
  });

  const handleConnect = async (platform: string) => {
    try {
      const fns: Record<string, () => Promise<{ authUrl: string }>> = {
        facebook: integrationsApi.authorizeFacebook,
        instagram: integrationsApi.authorizeInstagram,
        twitter: integrationsApi.authorizeTwitter,
        linkedin: integrationsApi.authorizeLinkedin,
      };
      if (fns[platform]) {
        const { authUrl } = await fns[platform]();
        window.location.href = authUrl;
      }
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  if (loadingSocial || loadingStripe || loadingShopify) {
    return (
      <div className="w-full px-6 py-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const social = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-500', connected: socialStatus?.facebook?.connected, info: socialStatus?.facebook?.pageName },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', connected: socialStatus?.instagram?.connected, info: socialStatus?.instagram?.username },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-sky-500', connected: socialStatus?.twitter?.connected, info: socialStatus?.twitter?.username },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', connected: socialStatus?.linkedin?.connected, info: socialStatus?.linkedin?.name },
  ];

  const whatsappStatus = whatsappConfig?.configured ? 'live' : 'pilot';
  const smsStatus = messagingStatus?.sms?.status ?? 'pilot';

  return (
    <div className="w-full px-6 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('integrations.title')}</h1>
        <p className="text-gray-600">{t('integrations.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">{t('integrations.messaging')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{t('integrations.whatsappTitle')}</CardTitle>
                    <CardDescription className="mt-1">{t('integrations.whatsappDesc')}</CardDescription>
                  </div>
                </div>
                <IntegrationStatusBadge status={whatsappStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!whatsappConfig?.configured && (
                <p className="text-xs text-muted-foreground">{t('integrations.whatsappPilotHint')}</p>
              )}
              <Button size="sm" variant="outline" asChild>
                <Link to="/settings?tab=whatsapp">{t('integrations.configure')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-600 p-3 rounded-lg">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{t('integrations.smsTitle')}</CardTitle>
                    <CardDescription className="mt-1">{t('integrations.smsDesc')}</CardDescription>
                  </div>
                </div>
                <IntegrationStatusBadge status={smsStatus} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!messagingStatus?.sms?.configured && (
                <p className="text-xs text-muted-foreground">{t('integrations.smsPilotHint')}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {messagingStatus?.sms?.configured
                  ? t('integrations.status.live')
                  : t('integrations.smsPilotHint')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">{t('integrations.social')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {social.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${p.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{p.name}</CardTitle>
                      </div>
                    </div>
                    {p.connected ? (
                      <Badge><Check className="w-3 h-3" /> {t('integrations.connected')}</Badge>
                    ) : (
                      <Badge variant="outline"><AlertCircle className="w-3 h-3" /> {t('integrations.notConnected')}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {p.connected && p.info && (
                    <p className="text-sm mb-3">{t('integrations.account', { info: p.info })}</p>
                  )}
                  {p.connected ? (
                    <Button variant="destructive" size="sm" onClick={() => disconnectMutation.mutate({ type: 'social', platform: p.id })}>
                      <Unlink className="w-4 h-4 mr-2" />{t('integrations.disconnect')}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleConnect(p.id)}>
                      <Link2 className="w-4 h-4 mr-2" />{t('integrations.connect')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">{t('integrations.ecommerce')}</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-3 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div><CardTitle>Shopify</CardTitle></div>
              </div>
              {shopifyStatus?.isConnected ? (
                <Badge><Check className="w-3 h-3" />{t('integrations.connected')}</Badge>
              ) : (
                <Badge variant="outline">{t('integrations.notConnected')}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {shopifyStatus?.isConnected && (
              <p className="text-sm mb-3">
                Produits: {shopifyStatus.shopifyProducts || 0} | Commandes: {shopifyStatus.shopifyOrders || 0}
              </p>
            )}
            {shopifyStatus?.isConnected ? (
              <Button variant="destructive" size="sm" onClick={() => disconnectMutation.mutate({ type: 'shopify' })}>
                <Unlink className="w-4 h-4 mr-2" />{t('integrations.disconnect')}
              </Button>
            ) : (
              <Button size="sm"><Link2 className="w-4 h-4 mr-2" />{t('integrations.connect')}</Button>
            )}
          </CardContent>
        </Card>
      </div>

      <TunisiaPaymentsPanel />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold border-b pb-2">{t('integrations.internationalPayments')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-3 rounded-lg"><CreditCard className="w-6 h-6 text-white" /></div>
                  <div><CardTitle>Stripe</CardTitle></div>
                </div>
                {stripeStatus?.connected ? <Badge>{t('integrations.status.live')}</Badge> : <Badge variant="outline">{t('integrations.notConnected')}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">Frais: 2.9% + 0.30 TND</p>
              {stripeStatus?.connected ? (
                <Button variant="destructive" size="sm" onClick={() => disconnectMutation.mutate({ type: 'stripe' })}>
                  <Unlink className="w-4 h-4 mr-2" />{t('integrations.disconnect')}
                </Button>
              ) : (
                <Button size="sm"><Link2 className="w-4 h-4 mr-2" />{t('integrations.connect')}</Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-3 rounded-lg"><Smartphone className="w-6 h-6 text-white" /></div>
                <div><CardTitle>Orange Money</CardTitle><CardDescription>Afrique</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">Frais: 1.5% + 100 FCFA</p>
              <Button size="sm" disabled>{t('integrations.comingSoon')}</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-3 rounded-lg"><Smartphone className="w-6 h-6 text-white" /></div>
                <div><CardTitle>MTN Money</CardTitle><CardDescription>MTN Afrique</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">Frais: 1.5% + 50 FCFA</p>
              <Button size="sm" disabled>{t('integrations.comingSoon')}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
