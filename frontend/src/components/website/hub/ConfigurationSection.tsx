import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface WebsiteConfig {
  siteName: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  features: {
    blog: boolean;
    ecommerce: boolean;
    booking: boolean;
    newsletter: boolean;
    reviews: boolean;
    chat: boolean;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

const ConfigurationSection: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<WebsiteConfig>({
    siteName: '',
    tagline: '',
    description: '',
    logo: '',
    favicon: '',
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    features: {
      blog: false,
      ecommerce: true,
      booking: false,
      newsletter: false,
      reviews: false,
      chat: false,
    },
    seo: {
      title: '',
      description: '',
      keywords: '',
    },
    social: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/website/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(response.data);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/website', config, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: 'Succès',
        description: 'Configuration enregistrée avec succès',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureToggle = (feature: keyof WebsiteConfig['features']) => {
    setConfig((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chargement de la configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations Générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Générales</CardTitle>
          <CardDescription>
            Configurez les informations de base de votre site web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                placeholder="Mon Super Site"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Slogan</Label>
              <Input
                id="tagline"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                placeholder="Votre slogan accrocheur"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Description courte de votre site..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
          <CardDescription>
            Activez ou désactivez les fonctionnalités de votre site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(config.features).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="text-base capitalize">{key}</Label>
                <p className="text-sm text-muted-foreground">
                  {key === 'blog' && 'Activer le blog sur votre site'}
                  {key === 'ecommerce' && 'Activer la boutique en ligne'}
                  {key === 'booking' && 'Système de réservation'}
                  {key === 'newsletter' && 'Inscription newsletter'}
                  {key === 'reviews' && 'Avis clients'}
                  {key === 'chat' && 'Chat en direct'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() => handleFeatureToggle(key as keyof WebsiteConfig['features'])}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Apparence */}
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>
            Personnalisez les couleurs de votre site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Couleur Principale</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="primaryColor"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Couleur Secondaire</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="secondaryColor"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  placeholder="#ec4899"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Référencement</CardTitle>
          <CardDescription>
            Optimisez votre site pour les moteurs de recherche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">Titre SEO</Label>
            <Input
              id="seoTitle"
              value={config.seo.title}
              onChange={(e) => setConfig({
                ...config,
                seo: { ...config.seo, title: e.target.value },
              })}
              placeholder="Titre pour les moteurs de recherche"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">Description SEO</Label>
            <Textarea
              id="seoDescription"
              value={config.seo.description}
              onChange={(e) => setConfig({
                ...config,
                seo: { ...config.seo, description: e.target.value },
              })}
              placeholder="Description pour les moteurs de recherche"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoKeywords">Mots-clés</Label>
            <Input
              id="seoKeywords"
              value={config.seo.keywords}
              onChange={(e) => setConfig({
                ...config,
                seo: { ...config.seo, keywords: e.target.value },
              })}
              placeholder="mot-clé1, mot-clé2, mot-clé3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationSection;
