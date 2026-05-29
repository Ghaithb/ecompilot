import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { adsApi } from '@/lib/adsApi';
import { TrendingUp, MousePointerClick, DollarSign, Eye, Loader2, AlertCircle } from 'lucide-react';

const AdsManagerPage: React.FC = () => {
  const { data: allCampaigns, isLoading } = useQuery({ queryKey: ['ads', 'all'], queryFn: adsApi.getAllCampaigns });
  const { data: googleCampaigns } = useQuery({ queryKey: ['ads', 'google'], queryFn: adsApi.google.getCampaigns });
  const { data: metaCampaigns } = useQuery({ queryKey: ['ads', 'meta'], queryFn: adsApi.meta.getCampaigns });
  const { data: tiktokCampaigns } = useQuery({ queryKey: ['ads', 'tiktok'], queryFn: adsApi.tiktok.getCampaigns });

  const getStatusBadge = (status: string) => {
    const cfg: any = { active: { variant: 'default', label: 'Active' }, paused: { variant: 'secondary', label: 'En pause' }, ended: { variant: 'outline', label: 'Terminée' } };
    const c = cfg[status] || cfg.active;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const renderCampaignCard = (c: any) => (
    <div key={c._id} className="p-4 border rounded-lg hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">{c.campaignName || c.name}</h3>
            {getStatusBadge(c.status)}
            <Badge variant="outline">{c.platform?.replace('_ads', '')?.toUpperCase()}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-1"><Eye className="w-4 h-4 text-blue-500" /><span>{(c.metrics?.impressions || 0).toLocaleString()} vues</span></div>
            <div className="flex items-center gap-1"><MousePointerClick className="w-4 h-4 text-green-500" /><span>{(c.metrics?.clicks || 0).toLocaleString()} clics</span></div>
            <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-purple-500" /><span>{c.metrics?.conversions || 0} conversions</span></div>
            <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-orange-500" /><span>{(c.metrics?.spend || 0).toFixed(2)} FCFA</span></div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>CTR: {(c.metrics?.ctr || 0).toFixed(2)}%</span>
            <span>CPC: {(c.metrics?.cpc || 0).toFixed(2)} FCFA</span>
            {c.metrics?.roas && <span>ROAS: {c.metrics.roas.toFixed(2)}x</span>}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const totalImpressions = allCampaigns?.campaigns?.reduce((sum: number, c: any) => sum + (c.metrics?.impressions || 0), 0) || 0;
  const totalClicks = allCampaigns?.campaigns?.reduce((sum: number, c: any) => sum + (c.metrics?.clicks || 0), 0) || 0;
  const totalSpent = allCampaigns?.campaigns?.reduce((sum: number, c: any) => sum + (c.metrics?.spend || 0), 0) || 0;
  const totalConversions = allCampaigns?.campaigns?.reduce((sum: number, c: any) => sum + (c.metrics?.conversions || 0), 0) || 0;

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div><h1 className="text-3xl font-bold flex items-center gap-3"><TrendingUp className="w-8 h-8" />Gestion des publicités</h1><p className="text-gray-600 mt-2">Suivez vos campagnes publicitaires</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Impressions</p><p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p></div><Eye className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Clics</p><p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p></div><MousePointerClick className="w-8 h-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Dépenses</p><p className="text-2xl font-bold">{totalSpent.toFixed(0)} F</p></div><DollarSign className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Conversions</p><p className="text-2xl font-bold">{totalConversions}</p></div><TrendingUp className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="all">Toutes ({allCampaigns?.total || 0})</TabsTrigger><TabsTrigger value="google">Google ({allCampaigns?.google || 0})</TabsTrigger><TabsTrigger value="meta">Meta ({allCampaigns?.meta || 0})</TabsTrigger><TabsTrigger value="tiktok">TikTok ({allCampaigns?.tiktok || 0})</TabsTrigger></TabsList>
        <TabsContent value="all" className="mt-4"><Card><CardHeader><CardTitle>Toutes les campagnes</CardTitle><CardDescription>{allCampaigns?.total || 0} campagne(s)</CardDescription></CardHeader><CardContent>{(!allCampaigns?.campaigns || allCampaigns.campaigns.length === 0) ? <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune campagne</p></div> : <div className="space-y-4">{allCampaigns.campaigns.map(renderCampaignCard)}</div>}</CardContent></Card></TabsContent>
        <TabsContent value="google" className="mt-4"><Card><CardHeader><CardTitle>Google Ads</CardTitle><CardDescription>{googleCampaigns?.length || 0} campagne(s)</CardDescription></CardHeader><CardContent>{(!googleCampaigns || googleCampaigns.length === 0) ? <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune campagne Google Ads</p></div> : <div className="space-y-4">{googleCampaigns.map(renderCampaignCard)}</div>}</CardContent></Card></TabsContent>
        <TabsContent value="meta" className="mt-4"><Card><CardHeader><CardTitle>Meta Ads (Facebook/Instagram)</CardTitle><CardDescription>{metaCampaigns?.length || 0} campagne(s)</CardDescription></CardHeader><CardContent>{(!metaCampaigns || metaCampaigns.length === 0) ? <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune campagne Meta Ads</p></div> : <div className="space-y-4">{metaCampaigns.map(renderCampaignCard)}</div>}</CardContent></Card></TabsContent>
        <TabsContent value="tiktok" className="mt-4"><Card><CardHeader><CardTitle>TikTok Ads</CardTitle><CardDescription>{tiktokCampaigns?.length || 0} campagne(s)</CardDescription></CardHeader><CardContent>{(!tiktokCampaigns || tiktokCampaigns.length === 0) ? <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune campagne TikTok Ads</p></div> : <div className="space-y-4">{tiktokCampaigns.map(renderCampaignCard)}</div>}</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdsManagerPage;