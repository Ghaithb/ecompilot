import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { adsApi, AdCampaign } from '@/lib/adsApi';
import { useToast } from '@/hooks/use-toast';

const AggregatedAdsView: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [counts, setCounts] = useState({ google: 0, meta: 0, tiktok: 0, total: 0 });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await adsApi.getAllCampaigns();
      setCampaigns(res.campaigns || []);
      setCounts({ google: res.google, meta: res.meta, tiktok: res.tiktok, total: res.total });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de récupérer les campagnes publicitaires (mock)', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vue agrégée des campagnes</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Google Ads</div>
            <div className="text-2xl font-bold">{counts.google}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Meta (FB/IG)</div>
            <div className="text-2xl font-bold">{counts.meta}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">TikTok Ads</div>
            <div className="text-2xl font-bold">{counts.tiktok}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-sm text-muted-foreground">Chargement des campagnes...</div>}
        {!loading && campaigns.length === 0 && <div className="text-sm text-muted-foreground">Aucune campagne disponible.</div>}

        {campaigns.map((c) => (
          <Card key={c._id}>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{c.campaignName}</div>
                  <div className="text-xs text-muted-foreground">Plateforme: {c.platform} • Statut: {c.status}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Impr.: {c.metrics?.impressions ?? '-'}</div>
                  <div className="text-sm">Clics: {c.metrics?.clicks ?? '-'}</div>
                  <div className="text-sm">Dépense: {c.metrics?.spend ?? '-'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AggregatedAdsView;
