import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2, Save, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';
import { fetchWebsiteConfig, updateStoreBranding, type StoreBranding } from '@/services/websiteSettingsApi';
import { StoreCoverHero } from '@/components/storefront';

type Props = {
  websiteId: string;
  storeName: string;
};

export function StoreBrandingPanel({ websiteId, storeName }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [branding, setBranding] = useState<StoreBranding>({});
  const [slogan, setSlogan] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const config = await fetchWebsiteConfig();
      const theme = config.theme || {};
      setBranding({
        logo: theme.logo,
        coverImage: theme.coverImage,
        slogan: theme.slogan,
      });
      setSlogan(theme.slogan || '');
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la personnalisation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load, websiteId]);

  const uploadFile = async (endpoint: string, field: string, file: File) => {
    const formData = new FormData();
    formData.append(field, file);
    const token = localStorage.getItem('auth_token');
    const res = await fetch(apiUrl(endpoint), {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur upload');
    }
    const data = await res.json();
    return data.url as string;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFile('/upload/logo', 'logo', file);
      const result = await updateStoreBranding({ logo: url });
      setBranding((prev) => ({ ...prev, logo: result.theme?.logo || url }));
      toast({ title: 'Logo enregistré', description: 'Visible sur votre boutique.' });
    } catch (err) {
      toast({
        title: 'Upload échoué',
        description: err instanceof Error ? err.message : 'Réessayez.',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadFile('/upload/cover', 'cover', file);
      const result = await updateStoreBranding({ coverImage: url });
      setBranding((prev) => ({ ...prev, coverImage: result.theme?.coverImage || url }));
      toast({ title: 'Couverture enregistrée', description: 'Bannière mise à jour sur la boutique.' });
    } catch (err) {
      toast({
        title: 'Upload échoué',
        description: err instanceof Error ? err.message : 'Réessayez.',
        variant: 'destructive',
      });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSaveSlogan = async () => {
    setSaving(true);
    try {
      const result = await updateStoreBranding({ slogan: slogan.trim() });
      setBranding((prev) => ({ ...prev, slogan: result.theme?.slogan }));
      toast({ title: 'Slogan enregistré' });
    } catch {
      toast({ title: 'Erreur', description: 'Sauvegarde impossible.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = async () => {
    setSaving(true);
    try {
      await updateStoreBranding({ logo: '' });
      setBranding((prev) => ({ ...prev, logo: undefined }));
      toast({ title: 'Logo supprimé' });
    } finally {
      setSaving(false);
    }
  };

  const removeCover = async () => {
    setSaving(true);
    try {
      await updateStoreBranding({ coverImage: '' });
      setBranding((prev) => ({ ...prev, coverImage: undefined }));
      toast({ title: 'Couverture supprimée' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo, couverture & slogan</CardTitle>
        <CardDescription>
          Logo et nom de la boutique dans l&apos;en-tête du site. Le slogan s&apos;affiche sur la bannière.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="storefront-root overflow-hidden rounded-xl border">
          <StoreCoverHero
            storeName={storeName}
            coverImage={branding.coverImage}
            slogan={slogan.trim() || 'Votre slogan ici'}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <Label>Logo</Label>
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed p-4">
              {branding.logo ? (
                <img
                  src={resolveUploadUrl(branding.logo)}
                  alt="Logo"
                  className="mb-3 max-h-16 object-contain"
                />
              ) : (
                <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Choisir logo
                </Button>
                {branding.logo && (
                  <Button type="button" variant="ghost" size="sm" onClick={removeLogo} disabled={saving}>
                    <X className="mr-1 h-4 w-4" />
                    Retirer
                  </Button>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Image de couverture</Label>
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-lg border border-dashed p-4">
              {branding.coverImage ? (
                <img
                  src={resolveUploadUrl(branding.coverImage)}
                  alt="Couverture"
                  className="mb-3 max-h-20 w-full rounded object-cover"
                />
              ) : (
                <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingCover}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {uploadingCover ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Choisir image
                </Button>
                {branding.coverImage && (
                  <Button type="button" variant="ghost" size="sm" onClick={removeCover} disabled={saving}>
                    <X className="mr-1 h-4 w-4" />
                    Retirer
                  </Button>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-slogan">Slogan</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="store-slogan"
              placeholder="Ex : Livraison rapide · Paiement à la réception"
              value={slogan}
              maxLength={200}
              onChange={(e) => setSlogan(e.target.value)}
            />
            <Button type="button" onClick={handleSaveSlogan} disabled={saving} className="sm:w-auto">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Affiché au centre de la bannière de couverture.</p>
        </div>
      </CardContent>
    </Card>
  );
}
