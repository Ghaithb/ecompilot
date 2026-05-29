import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Target, 
  TrendingUp, 
  Users,
  Send,
  Calendar,
  BarChart3,
  Gift
} from 'lucide-react';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing</h1>
        <p className="text-gray-500">
          Gérez vos campagnes marketing et fidélisation client
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taux d'ouverture</CardDescription>
            <CardTitle className="text-2xl">32.5%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>+5.2% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Emails envoyés</CardDescription>
            <CardTitle className="text-2xl">1,247</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Send className="h-4 w-4" />
              <span>Ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Conversions</CardDescription>
            <CardTitle className="text-2xl">89</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Target className="h-4 w-4" />
              <span>7.1% taux</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Clients fidèles</CardDescription>
            <CardTitle className="text-2xl">234</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Programme actif</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            <Mail className="h-4 w-4 mr-2" />
            Campagnes Email
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Gift className="h-4 w-4 mr-2" />
            Fidélité
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Calendar className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* Email Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campagnes Email</CardTitle>
                  <CardDescription>
                    Créez et gérez vos campagnes d'email marketing
                  </CardDescription>
                </div>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Nouvelle campagne
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample Campaign */}
                {[
                  {
                    name: 'Promo Été 2025',
                    status: 'sent',
                    sent: 1247,
                    opened: 405,
                    clicked: 89,
                    date: '15 Oct 2025',
                  },
                  {
                    name: 'Nouveaux Produits',
                    status: 'draft',
                    sent: 0,
                    opened: 0,
                    clicked: 0,
                    date: 'Brouillon',
                  },
                  {
                    name: 'Newsletter Mensuelle',
                    status: 'scheduled',
                    sent: 0,
                    opened: 0,
                    clicked: 0,
                    date: '20 Oct 2025',
                  },
                ].map((campaign, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge
                          variant={
                            campaign.status === 'sent'
                              ? 'default'
                              : campaign.status === 'scheduled'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {campaign.status === 'sent' && 'Envoyée'}
                          {campaign.status === 'draft' && 'Brouillon'}
                          {campaign.status === 'scheduled' && 'Planifiée'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{campaign.date}</p>
                    </div>
                    {campaign.status === 'sent' && (
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Envoyés:</span>
                          <span className="ml-1 font-medium">{campaign.sent}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Ouverts:</span>
                          <span className="ml-1 font-medium">{campaign.opened}</span>
                          <span className="text-xs text-gray-400 ml-1">
                            ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cliqués:</span>
                          <span className="ml-1 font-medium">{campaign.clicked}</span>
                          <span className="text-xs text-gray-400 ml-1">
                            ({((campaign.clicked / campaign.sent) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      {campaign.status === 'draft' ? 'Modifier' : 'Détails'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campagnes SMS</CardTitle>
                  <CardDescription>
                    Envoyez des SMS promotionnels à vos clients
                  </CardDescription>
                </div>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nouveau SMS
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Aucune campagne SMS pour le moment</p>
                <Button className="mt-4" variant="outline">
                  Créer ma première campagne
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty */}
        <TabsContent value="loyalty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programme de Fidélité</CardTitle>
              <CardDescription>
                Récompensez vos clients fidèles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      1€ = 10 points. 100 points = 1€ de réduction
                    </p>
                    <Button className="w-full mt-4" variant="outline">
                      Configurer
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coupons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Codes promo personnalisés pour vos clients
                    </p>
                    <Button className="w-full mt-4" variant="outline">
                      Créer coupon
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parrainage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Récompensez le parrain et le filleul
                    </p>
                    <Button className="w-full mt-4" variant="outline">
                      Activer
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Marketing</CardTitle>
              <CardDescription>
                Automatisez vos communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Email de bienvenue',
                    trigger: 'Nouvelle inscription',
                    active: true,
                  },
                  {
                    name: 'Panier abandonné',
                    trigger: 'Après 24h',
                    active: true,
                  },
                  {
                    name: 'Relance post-achat',
                    trigger: '7 jours après commande',
                    active: false,
                  },
                ].map((automation, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          automation.active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <div>
                        <h4 className="font-medium">{automation.name}</h4>
                        <p className="text-sm text-gray-500">
                          Déclencheur: {automation.trigger}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {automation.active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
