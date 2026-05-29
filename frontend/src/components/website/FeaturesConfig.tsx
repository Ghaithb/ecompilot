import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Calendar, 
  Mail, 
  Send, 
  BookOpen, 
  Image, 
  Briefcase,
  Star,
  HelpCircle,
  Globe,
  Save
} from 'lucide-react';

interface FeaturesConfigProps {
  features: any;
  onSave: (features: any) => void;
  saving: boolean;
}

const FeaturesConfig: React.FC<FeaturesConfigProps> = ({ features, onSave, saving }) => {
  const [localFeatures, setLocalFeatures] = useState(features);

  useEffect(() => {
    setLocalFeatures(features);
  }, [features]);

  const toggleFeature = (featureName: string) => {
    setLocalFeatures({
      ...localFeatures,
      [featureName]: {
        ...localFeatures[featureName],
        enabled: !localFeatures[featureName]?.enabled,
      },
    });
  };

  const updateFeatureConfig = (featureName: string, config: any) => {
    setLocalFeatures({
      ...localFeatures,
      [featureName]: {
        ...localFeatures[featureName],
        ...config,
      },
    });
  };

  const featuresList = [
    {
      name: 'ecommerce',
      title: 'E-commerce',
      description: 'Boutique en ligne avec panier et paiement',
      icon: ShoppingCart,
      color: 'text-blue-600',
      hasConfig: true,
    },
    {
      name: 'booking',
      title: 'Réservations',
      description: 'Système de réservation en ligne',
      icon: Calendar,
      color: 'text-green-600',
      hasConfig: true,
    },
    {
      name: 'contact',
      title: 'Formulaire de contact',
      description: 'Permettre aux visiteurs de vous contacter',
      icon: Mail,
      color: 'text-purple-600',
      hasConfig: true,
    },
    {
      name: 'newsletter',
      title: 'Newsletter',
      description: 'Collectez des emails et envoyez des newsletters',
      icon: Send,
      color: 'text-orange-600',
      hasConfig: true,
    },
    {
      name: 'blog',
      title: 'Blog',
      description: 'Publiez des articles de blog',
      icon: BookOpen,
      color: 'text-pink-600',
      hasConfig: false,
    },
    {
      name: 'gallery',
      title: 'Galerie',
      description: 'Affichez vos images dans une galerie',
      icon: Image,
      color: 'text-cyan-600',
      hasConfig: false,
    },
    {
      name: 'services',
      title: 'Services personnalisés',
      description: 'Créez vos propres services',
      icon: Briefcase,
      color: 'text-indigo-600',
      hasConfig: true,
    },
    {
      name: 'reviews',
      title: 'Avis clients',
      description: 'Collectez et affichez des témoignages',
      icon: Star,
      color: 'text-yellow-600',
      hasConfig: true,
    },
    {
      name: 'faq',
      title: 'FAQ',
      description: 'Questions fréquemment posées',
      icon: HelpCircle,
      color: 'text-teal-600',
      hasConfig: false,
    },
    {
      name: 'multiLanguage',
      title: 'Multi-langue',
      description: 'Site disponible en plusieurs langues',
      icon: Globe,
      color: 'text-red-600',
      hasConfig: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Fonctionnalités</CardTitle>
          <CardDescription>
            Activez ou désactivez les fonctionnalités de votre site web
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuresList.map((feature) => {
              const Icon = feature.icon;
              const isEnabled = localFeatures[feature.name]?.enabled || false;

              return (
                <Card key={feature.name} className={`border-2 ${isEnabled ? 'border-primary' : 'border-muted'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleFeature(feature.name)}
                      />
                    </div>

                    {/* Configuration spécifique si activé */}
                    {isEnabled && feature.hasConfig && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {feature.name === 'ecommerce' && (
                          <>
                            <div>
                              <Label className="text-xs">Taux de taxe (%)</Label>
                              <Input
                                type="number"
                                placeholder="20"
                                value={localFeatures.ecommerce?.taxRate || ''}
                                onChange={(e) => updateFeatureConfig('ecommerce', { taxRate: parseFloat(e.target.value) })}
                              />
                            </div>
                          </>
                        )}
                        {feature.name === 'booking' && (
                          <>
                            <div>
                              <Label className="text-xs">Places maximum par créneau</Label>
                              <Input
                                type="number"
                                placeholder="10"
                                value={localFeatures.booking?.maxGuestsPerSlot || ''}
                                onChange={(e) => updateFeatureConfig('booking', { maxGuestsPerSlot: parseInt(e.target.value) })}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Durée de réservation (minutes)</Label>
                              <Input
                                type="number"
                                placeholder="60"
                                value={localFeatures.booking?.bookingDuration || ''}
                                onChange={(e) => updateFeatureConfig('booking', { bookingDuration: parseInt(e.target.value) })}
                              />
                            </div>
                          </>
                        )}
                        {feature.name === 'contact' && (
                          <>
                            <div>
                              <Label className="text-xs">Email de notification</Label>
                              <Input
                                type="email"
                                placeholder="contact@example.com"
                                value={localFeatures.contact?.notificationEmail || ''}
                                onChange={(e) => updateFeatureConfig('contact', { notificationEmail: e.target.value })}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => onSave(localFeatures)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesConfig;
