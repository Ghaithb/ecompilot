import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Truck, UserPlus, Copy } from 'lucide-react';
import {
  fetchDrivers,
  inviteDriver,
  toggleDriver,
  type DriverSummary,
} from '@/services/driverManagementService';
import DriverReconciliationPanel from '@/components/drivers/DriverReconciliationPanel';
import { useTranslation } from 'react-i18next';

const DriversPage: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<DriverSummary[]>([]);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    vehicleType: 'moto',
  });
  const [lastInvite, setLastInvite] = useState<{ tempPassword: string; email: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetchDrivers()
      .then(setDrivers)
      .catch(() => toast({ title: 'Erreur chargement', variant: 'destructive' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async () => {
    if (form.fullName.trim().length < 2 || form.phone.trim().length < 8) {
      toast({ title: 'Nom et téléphone requis', variant: 'destructive' });
      return;
    }
    setInviting(true);
    try {
      const res = await inviteDriver({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        vehicleType: form.vehicleType,
      });
      setLastInvite({ tempPassword: res.tempPassword, email: res.driver.email });
      toast({
        title: 'Livreur invité',
        description: 'Identifiants envoyés par WhatsApp (si configuré).',
      });
      setForm({ fullName: '', phone: '', email: '', vehicleType: 'moto' });
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invitation impossible';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-7 h-7 text-primary" />
          {t('drivers.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('drivers.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t('drivers.invite')}
          </CardTitle>
          <CardDescription>{t('drivers.inviteHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>{t('drivers.fullName')} *</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Ahmed Ben Ali"
              />
            </div>
            <div>
              <Label>{t('drivers.phone')} *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <Label>{t('drivers.emailOptional')}</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="auto-généré si vide"
              />
            </div>
            <div>
              <Label>{t('drivers.vehicle')}</Label>
              <Input
                value={form.vehicleType}
                onChange={(e) => setForm((f) => ({ ...f, vehicleType: e.target.value }))}
                placeholder="moto, voiture…"
              />
            </div>
          </div>
          <Button onClick={handleInvite} disabled={inviting}>
            {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t('drivers.invite')}
          </Button>
          {lastInvite && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
              <p className="font-medium">Identifiants (à communiquer si WhatsApp échoue)</p>
              <p>Email : {lastInvite.email}</p>
              <p className="flex items-center gap-2">
                Mot de passe : <code>{lastInvite.tempPassword}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(lastInvite.tempPassword)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('drivers.team')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : drivers.length === 0 ? (
            <p className="text-muted-foreground">{t('drivers.noDrivers')}</p>
          ) : (
            <ul className="divide-y">
              {drivers.map((d) => (
                <li key={d._id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">
                      {d.fullName || `${d.firstName} ${d.lastName}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{d.phone} · {d.email}</p>
                  </div>
                  <Button
                    variant={d.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() =>
                      toggleDriver(d._id, !d.isActive).then(load).catch(() =>
                        toast({ title: 'Erreur', variant: 'destructive' }),
                      )
                    }
                  >
                    {d.isActive ? t('drivers.deactivate') : t('drivers.activate')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DriverReconciliationPanel />
    </div>
  );
};

export default DriversPage;
