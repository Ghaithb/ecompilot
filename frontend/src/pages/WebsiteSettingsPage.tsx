import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Palette, 
  Zap, 
  Globe, 
  Save,
  RefreshCw,
  Link2,
  BarChart3,
  LayoutTemplate,
} from 'lucide-react';
import FeaturesConfig from '@/components/website/FeaturesConfig';
import ThemeConfig from '@/components/website/ThemeConfig';
import SeoConfig from '@/components/website/SeoConfig';
import ServicesConfig from '@/components/website/ServicesConfig';
import DomainConfig from '@/components/website/DomainConfig';
import AnalyticsConfig from '@/components/website/AnalyticsConfig';
import TemplatePicker from '@/components/website/TemplatePicker';
import { apiUrl, getAuthHeaders } from '@/lib/apiConfig';

const WebsiteSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(apiUrl('/website/config'), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, data: any) => {
    setSaving(true);
    try {
      const endpoint = section === 'features' ? '/website/features' : '/website';
      const response = await fetch(apiUrl(endpoint), {
        method: section === 'features' ? 'PATCH' : 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Succès',
          description: 'Configuration mise à jour',
        });
        fetchConfig();
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun site web trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier site web pour accéder aux paramètres
            </p>
            <Button onClick={() => window.location.href = '/website'}>
              Créer un site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Configuration du Site</h1>
          <p className="text-muted-foreground text-lg">
            {config.name} • {config.slug}
          </p>
        </div>
        <Button onClick={fetchConfig} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="features">
            <Zap className="w-4 h-4 mr-2" />
            Fonctionnalités
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Thème
          </TabsTrigger>
          <TabsTrigger value="templates">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Link2 className="w-4 h-4 mr-2" />
            Domaine
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="services">
            <Settings className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <FeaturesConfig 
            features={config.features || {}}
            onSave={(features) => handleSave('features', { features })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="theme">
          <ThemeConfig 
            theme={config.theme || {}}
            onSave={(theme) => handleSave('theme', { theme })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatePicker currentTemplate={config.storeTemplate} onApplied={fetchConfig} />
        </TabsContent>

        <TabsContent value="domain">
          <DomainConfig />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsConfig analytics={config.analytics || {}} onSaved={fetchConfig} />
        </TabsContent>

        <TabsContent value="seo">
          <SeoConfig 
            seo={config.seo || {}}
            onSave={(seo) => handleSave('seo', { seo })}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="services">
          <ServicesConfig 
            services={config.features?.services?.customServices || []}
            onSave={fetchConfig}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteSettingsPage;
