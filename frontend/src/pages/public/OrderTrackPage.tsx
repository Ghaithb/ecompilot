import React, { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock3, Loader2, PackageCheck, Truck } from 'lucide-react';

type TrackingResult = {
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  statusHistory?: { status: string; changedAt: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Commande recue',
  created: 'Commande creee',
  confirmed: 'Confirmee',
  prepared: 'Preparee',
  assigned_to_driver: 'Chauffeur assigne',
  shipped: 'Expediee',
  out_for_delivery: 'En livraison',
  delivered: 'Livree',
  completed: 'Terminee',
  refused: 'Refusee',
  returned_to_seller: 'Retour vendeur',
  cancelled: 'Annulee',
};

const publicSteps = ['confirmed', 'prepared', 'shipped', 'out_for_delivery', 'delivered'];

function statusLabel(status: string) {
  return STATUS_LABELS[status] || status;
}

const OrderTrackPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');

  const activeIndex = useMemo(() => {
    if (!result) return -1;
    const index = publicSteps.indexOf(result.status);
    return index >= 0 ? index : 0;
  }, [result]);

  const track = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.get('/public/orders/track', {
        params: { orderNumber: orderNumber.trim(), phone: phone.trim() },
      });
      setResult(data);
    } catch {
      setError('Commande introuvable. Verifiez le numero et le telephone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Suivre ma commande</CardTitle>
            <p className="text-sm text-muted-foreground">
              Entrez votre numero de commande et le telephone utilise lors de l'achat.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">N commande</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex. ORD-12345"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <Button className="w-full" onClick={track} disabled={loading || !orderNumber.trim() || !phone.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suivre'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-3">
              <div className="rounded-xl bg-background p-4">
                <PackageCheck className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium">Confirmation</p>
                <p className="text-xs text-muted-foreground">Commande verifiee avant expedition.</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <Truck className="mb-3 h-5 w-5 text-blue-600" />
                <p className="text-sm font-medium">Livraison locale</p>
                <p className="text-xs text-muted-foreground">Statut mis a jour pendant le transport.</p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <Clock3 className="mb-3 h-5 w-5 text-amber-600" />
                <p className="text-sm font-medium">Support rapide</p>
                <p className="text-xs text-muted-foreground">Gardez le meme telephone pour etre contacte.</p>
              </div>
            </CardContent>
          </Card>

          {result ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                  <span>{result.orderNumber}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {statusLabel(result.status)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold tabular-nums">
                      {result.total} {result.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tracking</p>
                    <p className="font-mono text-sm">{result.trackingNumber || 'En preparation'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transporteur</p>
                    <p className="text-sm font-medium">{result.carrier || 'A confirmer'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {publicSteps.map((step, index) => {
                    const done = index <= activeIndex;
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                            done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {done ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{statusLabel(step)}</p>
                          <p className="text-xs text-muted-foreground">
                            {done ? 'Etape validee' : 'Prochaine etape'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {result.statusHistory?.length ? (
                  <div className="border-t pt-4">
                    <p className="mb-3 text-sm font-semibold">Historique</p>
                    <div className="space-y-2">
                      {result.statusHistory.map((item) => (
                        <div key={`${item.status}-${item.changedAt}`} className="flex justify-between gap-3 text-sm">
                          <span>{statusLabel(item.status)}</span>
                          <span className="text-muted-foreground">
                            {new Date(item.changedAt).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Votre suivi apparaitra ici apres verification.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackPage;
