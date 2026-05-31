import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { fetchCarrierManifest, PROVIDER_LABELS } from '../services/deliveryApi';
import type { DeliveryProviderId } from '../types/delivery.types';
import { formatTND } from '@/lib/currency';

interface CarrierManifestPanelProps {
  providers: Array<{ id: string; configured?: boolean }>;
}

export function CarrierManifestPanel({ providers }: CarrierManifestPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [provider, setProvider] = useState<DeliveryProviderId>(
    (providers[0]?.id as DeliveryProviderId) || 'intigo',
  );
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ parcels: number; codTotal: number } | null>(null);

  const handleDownload = async (format: 'json' | 'html') => {
    if (!provider) return;
    setLoading(true);
    try {
      const manifest = await fetchCarrierManifest(provider, format);
      setSummary(manifest.summary);

      if (format === 'html' && manifest.html) {
        const blob = new Blob([manifest.html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifest-${provider}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      if (manifest.summary.parcels === 0) {
        toast({ title: t('delivery.manifest.empty') });
      }
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (providers.length === 0) return null;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>{t('delivery.manifest.title')}</CardTitle>
        <CardDescription>{t('delivery.manifest.desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Select value={provider} onValueChange={(v) => setProvider(v as DeliveryProviderId)}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {PROVIDER_LABELS[p.id as DeliveryProviderId] || p.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleDownload('json')}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
              {t('delivery.manifest.download')}
            </Button>
            <Button size="sm" disabled={loading} onClick={() => handleDownload('html')}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
              {t('delivery.manifest.print')}
            </Button>
          </div>
        </div>
        {summary && (
          <p className="text-sm text-muted-foreground">
            {t('delivery.manifest.parcels', { count: summary.parcels })}
            {' · '}
            {t('delivery.manifest.codTotal', { amount: formatTND(summary.codTotal) })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
