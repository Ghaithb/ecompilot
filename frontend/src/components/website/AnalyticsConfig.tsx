import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Loader2 } from 'lucide-react';
import { updateWebsiteAnalytics } from '@/services/websiteSettingsApi';

type AnalyticsConfigProps = {
  analytics: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    enableTracking?: boolean;
  };
  onSaved: () => void;
};

const AnalyticsConfig: React.FC<AnalyticsConfigProps> = ({ analytics, onSaved }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [ga4, setGa4] = useState(analytics.googleAnalyticsId || '');
  const [pixel, setPixel] = useState(analytics.facebookPixelId || '');
  const [enabled, setEnabled] = useState(analytics.enableTracking !== false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWebsiteAnalytics({
        googleAnalyticsId: ga4.trim() || undefined,
        facebookPixelId: pixel.trim() || undefined,
        enableTracking: enabled,
      });
      toast({ title: 'Analytics enregistrés', description: 'Scripts injectés sur la boutique publique.' });
      onSaved();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Tracking visiteurs
        </CardTitle>
        <CardDescription>
          GA4 et Meta Pixel — événements checkout_started et purchase sur la boutique COD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium text-sm">Activer le tracking</p>
            <p className="text-xs text-muted-foreground">Scripts sur /store/:slug uniquement</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ga4">Google Analytics 4 (G-XXXXXXXX)</Label>
          <Input id="ga4" placeholder="G-XXXXXXXXXX" value={ga4} onChange={(e) => setGa4(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pixel">Meta Pixel ID</Label>
          <Input id="pixel" placeholder="123456789012345" value={pixel} onChange={(e) => setPixel(e.target.value)} />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsConfig;
