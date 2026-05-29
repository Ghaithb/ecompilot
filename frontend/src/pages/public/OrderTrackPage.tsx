import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const OrderTrackPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    statusHistory?: { status: string; changedAt: string }[];
  } | null>(null);
  const [error, setError] = useState('');

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
      setError('Commande introuvable. Vérifiez le numéro et le téléphone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Suivre ma commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="orderNumber">N° commande</Label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Ex. ORD-12345"
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+216 XX XXX XXX"
            />
          </div>
          <Button className="w-full" onClick={track} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suivre'}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {result && (
            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p>
                <strong>Statut :</strong> {result.status}
              </p>
              <p>
                <strong>Total :</strong> {result.total} {result.currency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTrackPage;
