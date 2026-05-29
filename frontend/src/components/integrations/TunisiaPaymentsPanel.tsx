import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { paymentGatewaysApi } from '@/lib/paymentGatewaysApi';
import { CreditCard, Smartphone, Truck, Loader2, Check, Unlink, Link2 } from 'lucide-react';

export const TunisiaPaymentsPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [konnectForm, setKonnectForm] = useState({ apiKey: '', walletId: '', sandbox: true });
  const [flouciForm, setFlouciForm] = useState({ publicKey: '', privateKey: '', sandbox: true });
  const [showKonnectForm, setShowKonnectForm] = useState(false);
  const [showFlouciForm, setShowFlouciForm] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['payment', 'tunisia'],
    queryFn: paymentGatewaysApi.getTunisiaStatus,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['payment', 'tunisia'] });

  const connectKonnect = useMutation({
    mutationFn: () => paymentGatewaysApi.connectKonnect(konnectForm),
    onSuccess: () => {
      invalidate();
      setShowKonnectForm(false);
      toast({ title: 'Konnect connecté', description: 'Vos clients peuvent payer via Konnect.' });
    },
    onError: () => toast({ title: 'Erreur', description: 'Connexion Konnect échouée', variant: 'destructive' }),
  });

  const connectFlouci = useMutation({
    mutationFn: () => paymentGatewaysApi.connectFlouci(flouciForm),
    onSuccess: () => {
      invalidate();
      setShowFlouciForm(false);
      toast({ title: 'Flouci connecté', description: 'Vos clients peuvent payer via Flouci.' });
    },
    onError: () => toast({ title: 'Erreur', description: 'Connexion Flouci échouée', variant: 'destructive' }),
  });

  const configureCod = useMutation({
    mutationFn: (payload: { enabled: boolean; otpRequired?: boolean }) =>
      paymentGatewaysApi.configureCod(payload),
    onSuccess: () => {
      invalidate();
      toast({ title: 'COD mis à jour' });
    },
  });

  const disconnect = useMutation({
    mutationFn: (provider: 'konnect' | 'flouci') => paymentGatewaysApi.disconnectProvider(provider),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Déconnecté' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold border-b pb-2">Paiements Tunisie</h2>
        <p className="text-sm text-gray-600 mt-2">
          Comme Converty et TikTak PRO : COD, Konnect et Flouci pour vos clients tunisiens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* COD */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-3 rounded-lg">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Paiement à la livraison</CardTitle>
                  <CardDescription>COD + OTP SMS</CardDescription>
                </div>
              </div>
              {status?.cod.enabled ? (
                <Badge><Check className="w-3 h-3" /> Actif</Badge>
              ) : (
                <Badge variant="outline">Inactif</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="cod-enabled">Activer le COD</Label>
              <Switch
                id="cod-enabled"
                checked={status?.cod.enabled ?? true}
                onCheckedChange={(enabled) => configureCod.mutate({ enabled, otpRequired: status?.cod.otpRequired })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cod-otp">Vérification SMS (OTP)</Label>
              <Switch
                id="cod-otp"
                checked={status?.cod.otpRequired ?? true}
                disabled={!status?.cod.enabled}
                onCheckedChange={(otpRequired) =>
                  configureCod.mutate({ enabled: status?.cod.enabled ?? true, otpRequired })
                }
              />
            </div>
            <p className="text-xs text-gray-500">
              Bloque l&apos;expédition tant que le client n&apos;a pas validé le code SMS.
            </p>
          </CardContent>
        </Card>

        {/* Konnect */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-3 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Konnect</CardTitle>
                  <CardDescription>Carte, wallet, e-DINAR</CardDescription>
                </div>
              </div>
              {status?.konnect.connected ? (
                <Badge><Check className="w-3 h-3" /> Connecté</Badge>
              ) : (
                <Badge variant="outline">Non connecté</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {status?.konnect.connected && status.konnect.walletId && (
              <p className="text-sm text-gray-600">Wallet: {status.konnect.walletId}</p>
            )}
            {showKonnectForm ? (
              <div className="space-y-3">
                <div>
                  <Label>Clé API Konnect</Label>
                  <Input
                    type="password"
                    value={konnectForm.apiKey}
                    onChange={(e) => setKonnectForm({ ...konnectForm, apiKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Wallet ID</Label>
                  <Input
                    value={konnectForm.walletId}
                    onChange={(e) => setKonnectForm({ ...konnectForm, walletId: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => connectKonnect.mutate()}
                  disabled={connectKonnect.isPending}
                >
                  {connectKonnect.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
              </div>
            ) : status?.konnect.connected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => disconnect.mutate('konnect')}
              >
                <Unlink className="w-4 h-4 mr-2" /> Déconnecter
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowKonnectForm(true)}>
                <Link2 className="w-4 h-4 mr-2" /> Connecter Konnect
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Flouci */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-violet-600 p-3 rounded-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Flouci</CardTitle>
                  <CardDescription>Paiement mobile Tunisie</CardDescription>
                </div>
              </div>
              {status?.flouci.connected ? (
                <Badge><Check className="w-3 h-3" /> Connecté</Badge>
              ) : (
                <Badge variant="outline">Non connecté</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showFlouciForm ? (
              <div className="space-y-3">
                <div>
                  <Label>Clé publique</Label>
                  <Input
                    value={flouciForm.publicKey}
                    onChange={(e) => setFlouciForm({ ...flouciForm, publicKey: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Clé privée</Label>
                  <Input
                    type="password"
                    value={flouciForm.privateKey}
                    onChange={(e) => setFlouciForm({ ...flouciForm, privateKey: e.target.value })}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => connectFlouci.mutate()}
                  disabled={connectFlouci.isPending}
                >
                  {connectFlouci.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </Button>
              </div>
            ) : status?.flouci.connected ? (
              <Button variant="destructive" size="sm" onClick={() => disconnect.mutate('flouci')}>
                <Unlink className="w-4 h-4 mr-2" /> Déconnecter
              </Button>
            ) : (
              <Button size="sm" onClick={() => setShowFlouciForm(true)}>
                <Link2 className="w-4 h-4 mr-2" /> Connecter Flouci
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TunisiaPaymentsPanel;
