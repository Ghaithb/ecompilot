import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, ShoppingCart, Package, AlertTriangle, Check } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email: {
      orders: true,
      products: true,
      lowStock: true,
      marketing: false,
      system: true,
    },
    push: {
      orders: true,
      products: false,
      lowStock: true,
      marketing: false,
      system: true,
    },
    sms: {
      orders: false,
      products: false,
      lowStock: true,
      marketing: false,
      system: false,
    },
  });

  const handleToggle = (channel: 'email' | 'push' | 'sms', type: string) => {
    setSettings((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type as keyof typeof prev[typeof channel]],
      },
    }));
  };

  const handleSave = () => {
    toast({
      title: 'Paramètres enregistrés',
      description: 'Vos préférences de notification ont été mises à jour',
    });
  };

  const notificationTypes = [
    {
      id: 'orders',
      name: 'Nouvelles commandes',
      description: 'Recevoir une notification pour chaque nouvelle commande',
      icon: ShoppingCart,
    },
    {
      id: 'products',
      name: 'Produits',
      description: 'Notifications sur les produits (ajout, modification)',
      icon: Package,
    },
    {
      id: 'lowStock',
      name: 'Stock faible',
      description: 'Alerte quand un produit est en rupture de stock',
      icon: AlertTriangle,
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Conseils et astuces pour développer votre business',
      icon: Mail,
    },
    {
      id: 'system',
      name: 'Système',
      description: 'Mises à jour importantes et notifications système',
      icon: Bell,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres de Notifications</h1>
        <p className="text-gray-500">
          Configurez vos préférences de notifications par canal
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Email</CardDescription>
            <CardTitle className="text-2xl">
              {Object.values(settings.email).filter(Boolean).length}/5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Types activés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Push</CardDescription>
            <CardTitle className="text-2xl">
              {Object.values(settings.push).filter(Boolean).length}/5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Types activés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>SMS</CardDescription>
            <CardTitle className="text-2xl">
              {Object.values(settings.sms).filter(Boolean).length}/5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Types activés</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences par Type de Notification</CardTitle>
          <CardDescription>
            Activez ou désactivez les notifications par canal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{type.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-14">
                    {/* Email */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <Label htmlFor={`email-${type.id}`} className="cursor-pointer">
                          Email
                        </Label>
                      </div>
                      <Switch
                        id={`email-${type.id}`}
                        checked={settings.email[type.id as keyof typeof settings.email]}
                        onCheckedChange={() => handleToggle('email', type.id)}
                      />
                    </div>

                    {/* Push */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-gray-600" />
                        <Label htmlFor={`push-${type.id}`} className="cursor-pointer">
                          Push
                        </Label>
                      </div>
                      <Switch
                        id={`push-${type.id}`}
                        checked={settings.push[type.id as keyof typeof settings.push]}
                        onCheckedChange={() => handleToggle('push', type.id)}
                      />
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <Label htmlFor={`sms-${type.id}`} className="cursor-pointer">
                          SMS
                        </Label>
                      </div>
                      <Switch
                        id={`sms-${type.id}`}
                        checked={settings.sms[type.id as keyof typeof settings.sms]}
                        onCheckedChange={() => handleToggle('sms', type.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notifications Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les emails de notification sont envoyés instantanément. Vérifiez votre dossier spam si vous ne les recevez pas.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notifications SMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Les SMS sont facturés 0.05€/SMS. Recommandé uniquement pour les alertes critiques (stock faible, nouvelles commandes).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
