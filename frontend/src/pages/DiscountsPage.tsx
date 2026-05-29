import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { couponsApi } from '@/lib/couponsApi';
import { Tag, Percent, Calendar, Users, TrendingUp, Loader2, Plus } from 'lucide-react';

const DiscountsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.getAll });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({ title: 'Supprimé', description: 'Code promo supprimé' });
    },
  });

  const getStatusBadge = (status: string) => {
    const cfg: any = { active: { variant: 'default', label: 'Actif' }, inactive: { variant: 'secondary', label: 'Inactif' }, expired: { variant: 'destructive', label: 'Expiré' } };
    const c = cfg[status] || cfg.active;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: any = { percentage: 'Pourcentage', fixed: 'Montant fixe', freeShipping: 'Livraison gratuite' };
    return labels[type] || type;
  };

  if (isLoading) return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const totalActive = coupons?.filter((c: any) => c.status === 'active').length || 0;
  const totalUsed = coupons?.reduce((sum: number, c: any) => sum + (c.usedCount || 0), 0) || 0;

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold flex items-center gap-3"><Tag className="w-8 h-8" />Codes promo</h1><p className="text-gray-600 mt-2">Gérez vos promotions</p></div><Button><Plus className="w-4 h-4 mr-2" />Créer un code</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total codes</p><p className="text-2xl font-bold">{coupons?.length || 0}</p></div><Tag className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Codes actifs</p><p className="text-2xl font-bold">{totalActive}</p></div><TrendingUp className="w-8 h-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Utilisations</p><p className="text-2xl font-bold">{totalUsed}</p></div><Users className="w-8 h-8 text-purple-500" /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Codes promotionnels</CardTitle><CardDescription>{coupons?.length || 0} code(s)</CardDescription></CardHeader>
        <CardContent>
          {(!coupons || coupons.length === 0) ? <div className="text-center py-12"><Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucun code promo</p></div> : (
            <div className="space-y-4">
              {coupons.map((c: any) => {
                const usagePercent = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : 0;
                return (
                  <div key={c._id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{c.code}</h3>
                          {getStatusBadge(c.status)}
                          <Badge variant="outline">{getTypeLabel(c.type)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1"><Percent className="w-4 h-4" />Réduction: {c.type === 'percentage' ? c.value + '%' : c.value + ' FCFA'}</span>
                          {c.validUntil && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Expire le {new Date(c.validUntil).toLocaleDateString('fr-FR')}</span>}
                        </div>
                        {c.maxUses && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Utilisation: {c.usedCount || 0}/{c.maxUses}</span>
                            <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: usagePercent + '%' }}></div></div>
                            <span className="text-gray-500">{usagePercent}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Modifier</Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(c._id)} disabled={deleteMutation.isPending}>Supprimer</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountsPage;