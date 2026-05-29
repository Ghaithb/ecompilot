import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Save,
  Plus,
  Trash2,
  Clock,
  CreditCard,
  Truck,
  HelpCircle,
  Settings,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ChatbotConfig {
  generalInfo: {
    storeName: string;
    storeDescription: string;
    welcomeMessage: string;
    primaryColor: string;
    accentColor: string;
  };
  businessHours: any;
  paymentConfig: {
    acceptedMethods: string[];
    orangeMoneyNumber?: string;
    mtnMoneyNumber?: string;
    waveNumber?: string;
    cashOnDelivery: boolean;
    paymentInstructions?: string;
  };
  shippingConfig: {
    deliveryZones: string[];
    deliveryCosts: Record<string, number>;
    estimatedDeliveryTime: string;
    freeShippingThreshold: number;
    shippingInstructions?: string;
  };
  faqs: Array<{
    question: string;
    answer: string;
    keywords: string[];
  }>;
  customResponses: {
    greetingMessage: string;
    goodbyeMessage: string;
    unavailableProductMessage: string;
    outOfStockMessage: string;
    orderConfirmationMessage: string;
    complaintHandlingMessage: string;
  };
  returnPolicy: {
    returnsAccepted: boolean;
    returnPeriodDays: number;
    returnConditions: string;
    returnInstructions?: string;
    refundAvailable: boolean;
    exchangeAvailable: boolean;
  };
  contactInfo: {
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    facebook?: string;
    instagram?: string;
  };
  botPersonality: string;
  useEmojis: boolean;
  isActive: boolean;
}

const ChatbotConfigPage: React.FC = () => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/rasa/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(response.data);
    } catch (error) {
      console.error('Erreur chargement config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/rasa/config`, config, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Configuration sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const addFAQ = () => {
    setConfig((prev) => ({
      ...prev!,
      faqs: [
        ...prev!.faqs,
        { question: '', answer: '', keywords: [] },
      ],
    }));
  };

  const removeFAQ = (index: number) => {
    setConfig((prev) => ({
      ...prev!,
      faqs: prev!.faqs.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!config) {
    return <div>Erreur de chargement</div>;
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            Configuration du Chatbot
          </h1>
          <p className="text-gray-600 mt-2">
            Personnalisez votre assistant virtuel avec vos données
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.isActive}
              onCheckedChange={(checked) =>
                setConfig({ ...config, isActive: checked })
              }
            />
            <Label>
              {config.isActive ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Actif
                </span>
              ) : (
                <span className="text-gray-500">Inactif</span>
              )}
            </Label>
          </div>
          <Button onClick={saveConfig} disabled={saving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
          <TabsTrigger value="shipping">Livraison</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="responses">Réponses</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* GÉNÉRAL */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>
                Informations de base sur votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom de la boutique</Label>
                <Input
                  value={config.generalInfo.storeName}
                  onChange={(e) =>
                    updateField('generalInfo', 'storeName', e.target.value)
                  }
                  placeholder="Ma Super Boutique"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={config.generalInfo.storeDescription}
                  onChange={(e) =>
                    updateField('generalInfo', 'storeDescription', e.target.value)
                  }
                  placeholder="Décrivez votre boutique..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Message de bienvenue</Label>
                <Textarea
                  value={config.generalInfo.welcomeMessage}
                  onChange={(e) =>
                    updateField('generalInfo', 'welcomeMessage', e.target.value)
                  }
                  placeholder="Bonjour ! Comment puis-je vous aider ?"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Couleur principale</Label>
                  <Input
                    type="color"
                    value={config.generalInfo.primaryColor}
                    onChange={(e) =>
                      updateField('generalInfo', 'primaryColor', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Couleur d'accent</Label>
                  <Input
                    type="color"
                    value={config.generalInfo.accentColor}
                    onChange={(e) =>
                      updateField('generalInfo', 'accentColor', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={config.useEmojis}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, useEmojis: checked })
                  }
                />
                <Label>Utiliser des emojis 😊</Label>
              </div>

              <div>
                <Label>Personnalité du bot</Label>
                <select
                  className="w-full border rounded p-2"
                  value={config.botPersonality}
                  onChange={(e) =>
                    setConfig({ ...config, botPersonality: e.target.value })
                  }
                >
                  <option value="friendly">Amical 😊</option>
                  <option value="professional">Professionnel 👔</option>
                  <option value="casual">Décontracté 🤙</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAIEMENT */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Moyens de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Moyens acceptés</Label>
                {['orange_money', 'mtn_money', 'wave', 'moov_money', 'card', 'cash'].map((method) => (
                  <div key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.paymentConfig.acceptedMethods.includes(method)}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...config.paymentConfig.acceptedMethods, method]
                          : config.paymentConfig.acceptedMethods.filter((m) => m !== method);
                        updateField('paymentConfig', 'acceptedMethods', methods);
                      }}
                    />
                    <Label>
                      {method === 'orange_money' && '📱 Orange Money'}
                      {method === 'mtn_money' && '📱 MTN Money'}
                      {method === 'wave' && '📱 Wave'}
                      {method === 'moov_money' && '📱 Moov Money'}
                      {method === 'card' && '💳 Carte bancaire'}
                      {method === 'cash' && '💵 Espèces'}
                    </Label>
                  </div>
                ))}
              </div>

              {config.paymentConfig.acceptedMethods.includes('orange_money') && (
                <div>
                  <Label>Numéro Orange Money</Label>
                  <Input
                    value={config.paymentConfig.orangeMoneyNumber || ''}
                    onChange={(e) =>
                      updateField('paymentConfig', 'orangeMoneyNumber', e.target.value)
                    }
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              )}

              {config.paymentConfig.acceptedMethods.includes('mtn_money') && (
                <div>
                  <Label>Numéro MTN Money</Label>
                  <Input
                    value={config.paymentConfig.mtnMoneyNumber || ''}
                    onChange={(e) =>
                      updateField('paymentConfig', 'mtnMoneyNumber', e.target.value)
                    }
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              )}

              <div>
                <Label>Instructions de paiement</Label>
                <Textarea
                  value={config.paymentConfig.paymentInstructions || ''}
                  onChange={(e) =>
                    updateField('paymentConfig', 'paymentInstructions', e.target.value)
                  }
                  placeholder="Instructions supplémentaires..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LIVRAISON */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Configuration de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Zones de livraison (séparées par des virgules)</Label>
                <Input
                  value={config.shippingConfig.deliveryZones.join(', ')}
                  onChange={(e) =>
                    updateField(
                      'shippingConfig',
                      'deliveryZones',
                      e.target.value.split(',').map((z) => z.trim())
                    )
                  }
                  placeholder="Dakar, Thiès, Saint-Louis"
                />
              </div>

              <div>
                <Label>Délai de livraison</Label>
                <Input
                  value={config.shippingConfig.estimatedDeliveryTime}
                  onChange={(e) =>
                    updateField('shippingConfig', 'estimatedDeliveryTime', e.target.value)
                  }
                  placeholder="2-5 jours ouvrables"
                />
              </div>

              <div>
                <Label>Livraison gratuite à partir de (FCFA)</Label>
                <Input
                  type="number"
                  value={config.shippingConfig.freeShippingThreshold}
                  onChange={(e) =>
                    updateField('shippingConfig', 'freeShippingThreshold', parseInt(e.target.value))
                  }
                  placeholder="50000"
                />
              </div>

              <div>
                <Label>Instructions de livraison</Label>
                <Textarea
                  value={config.shippingConfig.shippingInstructions || ''}
                  onChange={(e) =>
                    updateField('shippingConfig', 'shippingInstructions', e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Questions Fréquentes
              </CardTitle>
              <CardDescription>
                Ajoutez des réponses aux questions courantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.faqs.map((faq, index) => (
                <div key={index} className="border p-4 rounded space-y-2">
                  <div className="flex justify-between">
                    <Label>FAQ #{index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFAQ(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Question"
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...config.faqs];
                      newFaqs[index].question = e.target.value;
                      setConfig({ ...config, faqs: newFaqs });
                    }}
                  />
                  <Textarea
                    placeholder="Réponse"
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...config.faqs];
                      newFaqs[index].answer = e.target.value;
                      setConfig({ ...config, faqs: newFaqs });
                    }}
                    rows={3}
                  />
                </div>
              ))}
              <Button onClick={addFAQ} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une FAQ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RÉPONSES PERSONNALISÉES */}
        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Réponses Personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Message de salutation</Label>
                <Textarea
                  value={config.customResponses.greetingMessage}
                  onChange={(e) =>
                    updateField('customResponses', 'greetingMessage', e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Message d'au revoir</Label>
                <Textarea
                  value={config.customResponses.goodbyeMessage}
                  onChange={(e) =>
                    updateField('customResponses', 'goodbyeMessage', e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Produit indisponible</Label>
                <Textarea
                  value={config.customResponses.unavailableProductMessage}
                  onChange={(e) =>
                    updateField('customResponses', 'unavailableProductMessage', e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Rupture de stock</Label>
                <Textarea
                  value={config.customResponses.outOfStockMessage}
                  onChange={(e) =>
                    updateField('customResponses', 'outOfStockMessage', e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Confirmation de commande</Label>
                <Textarea
                  value={config.customResponses.orderConfirmationMessage}
                  onChange={(e) =>
                    updateField('customResponses', 'orderConfirmationMessage', e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Gestion des réclamations</Label>
                <Textarea
                  value={config.customResponses.complaintHandlingMessage}
                  onChange={(e) =>
                    updateField('customResponses', 'complaintHandlingMessage', e.target.value)
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Informations de Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={config.contactInfo.phone || ''}
                    onChange={(e) =>
                      updateField('contactInfo', 'phone', e.target.value)
                    }
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={config.contactInfo.whatsapp || ''}
                    onChange={(e) =>
                      updateField('contactInfo', 'whatsapp', e.target.value)
                    }
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={config.contactInfo.email || ''}
                  onChange={(e) =>
                    updateField('contactInfo', 'email', e.target.value)
                  }
                  placeholder="contact@boutique.com"
                />
              </div>

              <div>
                <Label>Adresse physique</Label>
                <Textarea
                  value={config.contactInfo.address || ''}
                  onChange={(e) =>
                    updateField('contactInfo', 'address', e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={config.contactInfo.facebook || ''}
                    onChange={(e) =>
                      updateField('contactInfo', 'facebook', e.target.value)
                    }
                    placeholder="facebook.com/maboutique"
                  />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={config.contactInfo.instagram || ''}
                    onChange={(e) =>
                      updateField('contactInfo', 'instagram', e.target.value)
                    }
                    placeholder="@maboutique"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotConfigPage;
