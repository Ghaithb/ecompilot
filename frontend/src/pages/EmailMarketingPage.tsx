import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { emailMarketingApi } from '@/lib/emailMarketingApi';
import { Mail, Send, Users, Eye, MousePointerClick, Loader2, Calendar, TrendingUp } from 'lucide-react';

const EmailMarketingPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({ queryKey: ['emailCampaigns'], queryFn: emailMarketingApi.getCampaigns });
  const { data: subscribers } = useQuery({ queryKey: ['emailSubscribers'], queryFn: emailMarketingApi.getSubscribers });

  const sendMutation = useMutation({
    mutationFn: (id: string) => emailMarketingApi.sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailCampaigns'] });
      toast({ title: 'Envoyée', description: 'Campagne en cours d envoi' });
    },
  });

  const getStatusBadge = (status: string) => {
    const cfg: any = { draft: { variant: 'secondary', label: 'Brouillon' }, scheduled: { variant: 'default', label: 'Programmée' }, sent: { variant: 'outline', label: 'Envoyée' }, sending: { variant: 'default', label: 'En cours' } };
    const c = cfg[status] || cfg.draft;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (isLoading) return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const totalSent = campaigns?.reduce((sum: number, c: any) => sum + (c.sentCount || 0), 0) || 0;
  const avgOpenRate = campaigns?.length ? (campaigns.reduce((sum: number, c: any) => sum + (c.openRate || 0), 0) / campaigns.length).toFixed(1) : '0.0';
  const avgClickRate = campaigns?.length ? (campaigns.reduce((sum: number, c: any) => sum + (c.clickRate || 0), 0) / campaigns.length).toFixed(1) : '0.0';

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold flex items-center gap-3"><Mail className="w-8 h-8" />Email Marketing</h1><p className="text-gray-600 mt-2">Créez et gérez vos campagnes</p></div><Button><Send className="w-4 h-4 mr-2" />Nouvelle campagne</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Abonnés</p><p className="text-2xl font-bold">{subscribers?.length || 0}</p></div><Users className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Emails envoyés</p><p className="text-2xl font-bold">{totalSent}</p></div><Send className="w-8 h-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Taux d ouverture</p><p className="text-2xl font-bold">{avgOpenRate}%</p></div><Eye className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Taux de clic</p><p className="text-2xl font-bold">{avgClickRate}%</p></div><MousePointerClick className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Campagnes récentes</CardTitle><CardDescription>{campaigns?.length || 0} campagne(s)</CardDescription></CardHeader>
        <CardContent>
          {(!campaigns || campaigns.length === 0) ? <div className="text-center py-12"><Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune campagne</p></div> : (
            <div className="space-y-4">
              {campaigns.map((c: any) => (
                <div key={c._id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{c.name}</h3>
                        {getStatusBadge(c.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Sujet: {c.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Send className="w-4 h-4" />{c.sentCount || 0} envoyés</span>
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{c.openRate || 0}% ouvert</span>
                        <span className="flex items-center gap-1"><MousePointerClick className="w-4 h-4" />{c.clickRate || 0}% cliqué</span>
                        {c.scheduledAt && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(c.scheduledAt).toLocaleDateString('fr-FR')}</span>}
                      </div>
                    </div>
                    {c.status === 'draft' && <Button size="sm" onClick={() => sendMutation.mutate(c._id)} disabled={sendMutation.isPending}><Send className="w-4 h-4 mr-2" />Envoyer</Button>}
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

export default EmailMarketingPage;