import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import {
  fetchReconciliation,
  settleDriver,
  fetchManifest,
  type ReconciliationSummary,
  type DriverReconciliation,
} from '@/services/driverManagementService';
import { formatTND } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

function openManifestPrint(manifest: Awaited<ReturnType<typeof fetchManifest>>) {
  const rows = manifest.items
    .map(
      (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.orderNumber}</td>
        <td>${escapeHtml(it.customerName)}</td>
        <td>${escapeHtml(it.phone ?? '')}</td>
        <td>${escapeHtml(it.address)}</td>
        <td style="text-align:right">${it.isCod ? formatTND(it.codAmount) : '—'}</td>
        <td style="width:90px"></td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8" />
    <title>Bordereau ${escapeHtml(manifest.driver.name)}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px;}
      h1{font-size:18px;margin:0 0 4px;}
      .meta{font-size:12px;color:#555;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;font-size:12px;}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top;}
      th{background:#f3f4f6;}
      .summary{margin:12px 0;font-size:13px;font-weight:bold;}
      .sign{margin-top:32px;font-size:12px;display:flex;justify-content:space-between;}
      @media print{button{display:none;}}
    </style></head><body>
    <h1>Bordereau d'enlèvement — ${escapeHtml(manifest.driver.name)}</h1>
    <div class="meta">
      Tél : ${escapeHtml(manifest.driver.phone ?? '—')} ·
      Généré le ${new Date(manifest.generatedAt).toLocaleString('fr-FR')}
    </div>
    <div class="summary">
      ${manifest.summary.parcels} colis · ${manifest.summary.codParcels} en COD ·
      Total à encaisser : ${formatTND(manifest.summary.codTotal)}
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Commande</th><th>Client</th><th>Téléphone</th>
        <th>Adresse</th><th style="text-align:right">COD</th><th>Émargement</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="7">Aucun colis actif</td></tr>'}</tbody>
    </table>
    <div class="sign">
      <span>Signature commerçant : ____________________</span>
      <span>Signature livreur : ____________________</span>
    </div>
    <button onclick="window.print()" style="margin-top:24px;padding:8px 16px;">Imprimer</button>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DriverReconciliationPanel: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReconciliationSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchReconciliation()
      .then(setData)
      .catch(() => toast({ title: 'Erreur chargement réconciliation', variant: 'destructive' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSettle = async (d: DriverReconciliation) => {
    if (d.pendingAmount <= 0) return;
    const ok = window.confirm(
      `Confirmer la remise de ${formatTND(d.pendingAmount)} par ${d.name} (${d.pendingCount} commande(s)) ?`,
    );
    if (!ok) return;
    setBusy(d.driverId);
    try {
      const res = await settleDriver(d.driverId);
      toast({
        title: 'Remise enregistrée',
        description: `${formatTND(res.settledAmount)} réglés sur ${res.settledCount} commande(s).`,
      });
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Remise impossible';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const handleManifest = async (d: DriverReconciliation) => {
    setBusy(d.driverId);
    try {
      const manifest = await fetchManifest(d.driverId);
      if (manifest.summary.parcels === 0) {
        toast({ title: 'Aucun colis actif', description: `${d.name} n'a pas de colis en cours.` });
        return;
      }
      openManifestPrint(manifest);
    } catch {
      toast({ title: 'Erreur bordereau', variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          {t('drivers.reconciliation')}
        </CardTitle>
        <CardDescription>
          {t('drivers.reconciliationHint')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : !data ? (
          <p className="text-muted-foreground">{t('common.error')}</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold tabular-nums">{formatTND(data.summary.totalToCollect)}</p>
                <p className="text-xs text-muted-foreground">{t('drivers.totalToCollect')}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold tabular-nums">{data.summary.ordersPending}</p>
                <p className="text-xs text-muted-foreground">{t('drivers.ordersPending')}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold tabular-nums">{data.summary.driversWithCash}</p>
                <p className="text-xs text-muted-foreground">{t('drivers.driversWithCash')}</p>
              </div>
            </div>

            {data.drivers.length === 0 ? (
              <p className="text-muted-foreground">{t('drivers.noDrivers')}</p>
            ) : (
              <ul className="divide-y">
                {data.drivers.map((d) => (
                  <li key={d.driverId} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium">{d.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {d.pendingAmount > 0 ? (
                          <span className="text-amber-600 font-medium">
                            {t('drivers.toRemit', { amount: formatTND(d.pendingAmount), count: d.pendingCount })}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" /> {t('drivers.upToDate')}
                          </span>
                        )}
                        {d.settledCount > 0 && (
                          <span className="ml-2 text-muted-foreground">
                            · {t('drivers.alreadySettled', { amount: formatTND(d.settledAmount) })}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy === d.driverId}
                        onClick={() => handleManifest(d)}
                      >
                        <FileText className="w-4 h-4 mr-1" /> {t('drivers.manifest')}
                      </Button>
                      <Button
                        size="sm"
                        disabled={busy === d.driverId || d.pendingAmount <= 0}
                        onClick={() => handleSettle(d)}
                      >
                        {busy === d.driverId ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : null}
                        {t('drivers.settleCash')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverReconciliationPanel;
