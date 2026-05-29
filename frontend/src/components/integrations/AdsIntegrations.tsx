import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adsApi } from '@/lib/adsApi';
import { useToast } from '@/hooks/use-toast';

const AdsIntegrations: React.FC = () => {
  const { toast } = useToast();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [metaConnected, setMetaConnected] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mockCode, setMockCode] = useState('');

  useEffect(() => {
    // TODO: fetch actual integration status from backend when available
  }, []);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await adsApi.google.authorize();
      // In a real flow we'd redirect to the provider URL. For now show toast (mock).
      toast({ title: 'Google Ads', description: 'Ouvrez l\'URL d\'autorisation (mock) dans un nouvel onglet.' });
      // simulate connected when a mock code is entered
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de récupérer l\'URL Google Ads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (!mockCode) {
      toast({ title: 'Code requis', description: 'Entrez un code mock pour connecter Google Ads', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await adsApi.google.connect(mockCode);
      setGoogleConnected(true);
      toast({ title: 'Connecté', description: 'Google Ads connecté (mock)' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de connecter Google Ads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMetaAuth = async () => {
    setLoading(true);
    try {
      await adsApi.meta.authorize();
      toast({ title: 'Meta Ads', description: 'Ouvrez l\'URL d\'autorisation Meta (mock).' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de récupérer l\'URL Meta Ads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMeta = async () => {
    if (!mockCode) {
      toast({ title: 'Code requis', description: 'Entrez un code mock pour connecter Meta Ads', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await adsApi.meta.connect(mockCode);
      setMetaConnected(true);
      toast({ title: 'Connecté', description: 'Meta Ads connecté (mock)' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de connecter Meta Ads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTiktokAuth = async () => {
    setLoading(true);
    try {
      await adsApi.tiktok.authorize();
      toast({ title: 'TikTok Ads', description: 'Ouvrez l\'URL d\'autorisation TikTok (mock).' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de récupérer l\'URL TikTok Ads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectTiktok = async () => {
    if (!mockCode) {
      toast({ title: 'Code requis', description: 'Entrez un code mock pour connecter TikTok Ads', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await adsApi.tiktok.connect(mockCode);
      setTiktokConnected(true);
      toast({ title: 'Connecté', description: 'TikTok Ads connecté (mock)' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de connecter TikTok Ads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Intégrations Publicitaires</h3>
      <p className="text-sm text-muted-foreground">Connectez vos comptes Google Ads, Meta (Facebook/Instagram) et TikTok Ads pour centraliser les campagnes.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardContent>
            <h4 className="font-medium">Google Ads</h4>
            <p className="text-sm text-muted-foreground mb-3">Connectez via OAuth (mock)</p>
            <div className="flex gap-2">
              <Button onClick={handleGoogleAuth} disabled={loading}>Autoriser (mock)</Button>
              <Button variant={googleConnected ? 'secondary' : 'ghost'} onClick={handleConnectGoogle} disabled={loading}>{googleConnected ? 'Connecté' : 'Connecter'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h4 className="font-medium">Meta (Facebook / Instagram)</h4>
            <p className="text-sm text-muted-foreground mb-3">Connectez vos Business Accounts (mock)</p>
            <div className="flex gap-2">
              <Button onClick={handleMetaAuth} disabled={loading}>Autoriser (mock)</Button>
              <Button variant={metaConnected ? 'secondary' : 'ghost'} onClick={handleConnectMeta} disabled={loading}>{metaConnected ? 'Connecté' : 'Connecter'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h4 className="font-medium">TikTok Ads</h4>
            <p className="text-sm text-muted-foreground mb-3">Connectez vos comptes TikTok Ads (mock)</p>
            <div className="flex gap-2">
              <Button onClick={handleTiktokAuth} disabled={loading}>Autoriser (mock)</Button>
              <Button variant={tiktokConnected ? 'secondary' : 'ghost'} onClick={handleConnectTiktok} disabled={loading}>{tiktokConnected ? 'Connecté' : 'Connecter'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Label htmlFor="mockCode">Code d'autorisation (mock)</Label>
        <Input id="mockCode" value={mockCode} onChange={(e) => setMockCode(e.target.value)} placeholder="Entrez un code mock retourné par le provider" />
        <p className="text-xs text-muted-foreground mt-2">Utilisez un code mock pour simuler la connexion lors du développement.</p>
      </div>
    </div>
  );
};

export default AdsIntegrations;
