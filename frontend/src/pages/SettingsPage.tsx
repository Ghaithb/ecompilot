import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  User,
  Store,
  Bell,
  Globe,
  CreditCard,
  Shield,
  Zap,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import CurrencySettingsPage from './CurrencySettingsPage';
import NotificationsSettingsPage from './NotificationsSettingsPage';
import WhatsAppSettingsPage from './WhatsAppSettingsPage';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Centre de configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez tous les paramètres de votre e-commerce
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Boutique</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Devises</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Paiements</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Intégrations</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Avancé</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configuration de base de votre plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom de la boutique</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    defaultValue={user?.tenant?.name || ''}
                    placeholder="Ma Super Boutique"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email de contact</label>
                  <input
                    type="email"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    defaultValue={user?.email || ''}
                    placeholder="contact@boutique.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fuseau horaire</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>UTC+1 (Paris)</option>
                    <option>UTC+0 (Londres)</option>
                    <option>UTC-5 (New York)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Langue par défaut</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
              </div>
              <Button className="mt-4">Sauvegarder les modifications</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>Gérez vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Prénom</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Nom</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    defaultValue={user?.email || ''}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
              <Button className="mt-4">Mettre à jour le profil</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de la boutique</CardTitle>
              <CardDescription>
                Paramètres de votre magasin en ligne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Description de la boutique</label>
                  <textarea
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows={4}
                    placeholder="Décrivez votre boutique..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Adresse</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="123 Rue Example"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Code postal</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="75001"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ville</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Pays</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>France</option>
                      <option>Belgique</option>
                      <option>Suisse</option>
                      <option>Canada</option>
                    </select>
                  </div>
                </div>
              </div>
              <Button className="mt-4">Sauvegarder</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <NotificationsSettingsPage />
        </TabsContent>

        {/* Currency Tab */}
        <TabsContent value="currency" className="mt-6">
          <CurrencySettingsPage />
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement</CardTitle>
              <CardDescription>
                Configurez les moyens de paiement acceptés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-gray-600">Cartes bancaires internationales</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Orange Money</p>
                      <p className="text-sm text-gray-600">Mobile Money Afrique</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Paiement à la livraison</p>
                      <p className="text-sm text-gray-600">Cash on delivery</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Activer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppSettingsPage />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et confidentialité</CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Changer le mot de passe</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Mot de passe actuel"
                    />
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Nouveau mot de passe"
                    />
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                  <Button className="mt-3">Mettre à jour le mot de passe</Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Authentification à deux facteurs</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ajoutez une couche de sécurité supplémentaire
                  </p>
                  <Button variant="outline">Activer 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Intégrations tierces</CardTitle>
              <CardDescription>
                Connectez vos outils et services externes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Gérez vos intégrations depuis la section Connexions</p>
                <Button variant="outline" className="mt-4">
                  Aller aux intégrations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
              <CardDescription>
                Configuration technique de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-gray-600">
                      Désactiver temporairement votre boutique
                    </p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">API publique</p>
                    <p className="text-sm text-gray-600">
                      Permettre l'accès à l'API
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Gérer les clés</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-700">Zone dangereuse</p>
                    <p className="text-sm text-red-600">
                      Supprimer définitivement mon compte
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">Supprimer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
