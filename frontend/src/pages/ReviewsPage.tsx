import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { reviewsApi } from '@/lib/reviewsApi';
import { Star, MessageSquare, TrendingUp, Check, X, Loader2, ThumbsUp } from 'lucide-react';

const ReviewsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviewsData, isLoading } = useQuery({ queryKey: ['reviews'], queryFn: () => reviewsApi.getAll() });
  const { data: stats } = useQuery({ queryKey: ['reviews', 'stats'], queryFn: reviewsApi.getStats });

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Approuvé', description: 'Avis maintenant visible' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: 'Rejeté', description: 'Avis rejeté' });
    },
  });

  const reviews = reviewsData?.reviews || [];

  const getStatusBadge = (status: string) => {
    const cfg: any = { approved: { variant: 'default', label: 'Approuvé' }, pending: { variant: 'secondary', label: 'En attente' }, rejected: { variant: 'destructive', label: 'Rejeté' } };
    const c = cfg[status] || cfg.pending;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
    </div>
  );

  if (isLoading) return <div className="w-full px-6 py-6 flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div><h1 className="text-3xl font-bold flex items-center gap-3"><MessageSquare className="w-8 h-8" />Avis clients</h1><p className="text-gray-600 mt-2">Gérez les avis de vos clients</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats?.total || 0}</p></div><MessageSquare className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Note moyenne</p><p className="text-2xl font-bold">{stats?.averageRating?.toFixed(1) || '0.0'}</p></div><Star className="w-8 h-8 text-yellow-500 fill-yellow-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">En attente</p><p className="text-2xl font-bold">{stats?.pending || 0}</p></div><TrendingUp className="w-8 h-8 text-orange-500" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Approuvés</p><p className="text-2xl font-bold">{stats?.approved || 0}</p></div><Check className="w-8 h-8 text-green-500" /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Liste des avis</CardTitle><CardDescription>{reviews.length} avis</CardDescription></CardHeader>
        <CardContent>
          {reviews.length === 0 ? <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucun avis</p></div> : (
            <div className="space-y-4">
              {reviews.map((r: any) => (
                <div key={r._id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{r.customer.name}</h3>
                        {renderStars(r.rating)}
                        {getStatusBadge(r.status)}
                      </div>
                      <p className="text-sm text-gray-600">{r.product.title}  {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(r._id)} disabled={approveMutation.isPending}><Check className="w-4 h-4 text-green-600" /></Button>
                        <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(r._id)} disabled={rejectMutation.isPending}><X className="w-4 h-4 text-red-600" /></Button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{r.comment}</p>
                  {r.status === 'approved' && <span className="flex items-center gap-1 text-sm text-gray-600"><ThumbsUp className="w-4 h-4" />{r.helpful} utile(s)</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsPage;