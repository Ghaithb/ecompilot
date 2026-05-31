import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RotateCcw } from 'lucide-react';

type ReturnOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  refusalReason?: string;
  returnReason?: string;
  codTrustScore?: number;
  codTrustLevel?: string;
};

const RISK_COLORS: Record<string, string> = {
  trusted: 'bg-emerald-50 text-emerald-700',
  normal: 'bg-blue-50 text-blue-700',
  suspect: 'bg-amber-50 text-amber-800',
  blocked: 'bg-red-50 text-red-700',
};

const ReturnsPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [stats, setStats] = useState<{ returnRatePercent: number; refused: number } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([
        api.get<ReturnOrder[]>('/orders/returns/list'),
        api.get('/orders/returns/stats'),
      ]);
      setOrders(list.data);
      setStats(st.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const completeReturn = async (id: string, decision: 'completed' | 'rejected') => {
    try {
      await api.patch(`/orders/${id}/return/complete`, { decision });
      toast({
        title: decision === 'completed' ? t('returns.completed') : t('returns.rejected'),
      });
      load();
    } catch {
      toast({ title: t('returns.error'), variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <RotateCcw className="w-7 h-7" />
        {t('returns.title')}
      </h1>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{t('returns.refusalRate')}</p>
              <p className="text-2xl font-bold">{stats.returnRatePercent}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{t('returns.totalRefused')}</p>
              <p className="text-2xl font-bold">{stats.refused}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('returns.toProcess')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="animate-spin w-6 h-6" />
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">{t('returns.none')}</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">#{o.orderNumber}</p>
                    {o.codTrustLevel && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[o.codTrustLevel] || 'bg-muted'}`}
                      >
                        {t('returns.codRisk')}: {o.codTrustLevel}
                        {o.codTrustScore != null ? ` (${o.codTrustScore})` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm capitalize">{o.status.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('returns.reason')}: {o.refusalReason || o.returnReason || '—'}
                  </p>
                  {o.status === 'returned_to_seller' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => completeReturn(o._id, 'completed')}>
                        {t('returns.approve')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => completeReturn(o._id, 'rejected')}>
                        {t('returns.reject')}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnsPage;
