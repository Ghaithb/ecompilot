import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Globe, Loader2, RefreshCw, Shield } from 'lucide-react';
import {
  fetchDomainStatus,
  updateCustomDomain,
  verifyDomainDns,
  type DomainStatus,
} from '@/services/websiteSettingsApi';

const DomainConfig: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [customDomain, setCustomDomain] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDomainStatus();
      setStatus(data);
      setCustomDomain(data.customDomain || '');
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger le domaine', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateCustomDomain(customDomain.trim() || undefined);
      setStatus(data);
      toast({ title: 'Domaine enregistré', description: 'Configurez le DNS puis vérifiez.' });
    } catch (err: unknown) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const data = await verifyDomainDns();
      setStatus(data);
      toast({
        title: data.verified ? 'DNS vérifié' : 'DNS non détecté',
        description: data.verified
          ? 'Votre domaine pointe correctement vers EcomPilot.'
          : 'Vérifiez le CNAME et réessayez dans quelques minutes.',
        variant: data.verified ? 'default' : 'destructive',
      });
    } catch (err: unknown) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Vérification échouée',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            URL par défaut
          </CardTitle>
          <CardDescription>Lien EcomPilot — toujours actif</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block rounded-lg bg-muted px-3 py-2 text-sm">{status?.defaultUrl}</code>
          <p className="text-xs text-muted-foreground mt-2">Sous-domaine suggéré : {status?.subdomainHint}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Domaine personnalisé
            {status?.dnsVerified && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Vérifié
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Connectez votre nom de domaine (ex. maboutique.tn)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customDomain">Domaine</Label>
            <Input
              id="customDomain"
              placeholder="maboutique.tn"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Instructions DNS
            </p>
            <p>
              <span className="text-muted-foreground">CNAME :</span> {status?.instructions.cname}
            </p>
            <p>
              <span className="text-muted-foreground">Racine :</span> {status?.instructions.root}
            </p>
            <p className="text-xs text-muted-foreground">
              Cible : <code>{status?.dnsTarget}</code>
            </p>
          </div>

          {status?.checks?.length ? (
            <div className="text-xs space-y-1">
              {status.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge variant={c.ok ? 'default' : 'secondary'}>{c.type}</Badge>
                  <span>{c.host}</span>
                  {c.value && <span className="text-muted-foreground truncate">→ {c.value}</span>}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
            <Button variant="outline" onClick={handleVerify} disabled={verifying || !customDomain.trim()}>
              {verifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Vérifier DNS
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainConfig;
