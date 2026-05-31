import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { whatsappService, WhatsAppStatistics } from '@/services/whatsappService';
import { 
  MessageSquare, 
  Send, 
  Settings, 
  BarChart3, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Bell,
  Package,
  ShoppingCart,
  AlertTriangle,
  Copy
} from 'lucide-react';

export default function WhatsAppSettingsPage() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<any>(null);
  const [statistics, setStatistics] = useState<WhatsAppStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, statsData] = await Promise.all([
        whatsappService.checkConfiguration(),
        whatsappService.getStatistics(),
      ]);
      setConfig(configData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast({
        title: t('whatsapp.requiredFields'),
        description: t('whatsapp.fillPhoneMessage'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await whatsappService.sendMessage({
        to: testPhone,
        message: testMessage,
      });

      toast({
        title: t('whatsapp.sent'),
        description: t('whatsapp.sentDesc'),
      });

      setTestPhone('');
      setTestMessage('');
      loadData();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('whatsapp.sendError'),
        variant: 'destructive',
      });
    }
  };

  const handleCopyWidgetCode = async () => {
    if (!config?.businessNumber) return;

    const widgetCode = `
<!-- Widget WhatsApp -->
<a href="https://wa.me/${config.businessNumber}?text=Bonjour,%20je%20suis%20intéressé%20par%20vos%20produits" 
   target="_blank" 
   style="position:fixed;bottom:20px;right:20px;background:#25D366;color:white;padding:15px;border-radius:50px;text-decoration:none;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
  💬 WhatsApp
</a>
    `.trim();

    await navigator.clipboard.writeText(widgetCode);
    
    toast({
      title: t('whatsapp.copied'),
      description: t('whatsapp.widgetCopied'),
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">{t('whatsapp.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-green-600" />
          {t('whatsapp.title')}
        </h1>
        <p className="text-gray-500">
          {t('whatsapp.subtitle')}
        </p>
      </div>

      {/* Status Card */}
      <Card className={config?.configured ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config?.configured ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            {t('whatsapp.configStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config?.configured ? (
            <div className="space-y-2">
              <p className="text-green-700 dark:text-green-300 font-medium">
                ✅ {t('whatsapp.configured')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">{t('whatsapp.provider')}:</p>
                  <p className="font-medium">{config.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('whatsapp.businessNumber')}:</p>
                  <p className="font-medium">{config.businessNumber}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                ⚠️ {t('whatsapp.notConfigured')}
              </p>
              <p className="text-sm text-gray-600">
                {t('whatsapp.notConfiguredHint')}
              </p>
              <Button variant="outline" className="mt-2" onClick={() => window.open('https://business.facebook.com', '_blank')}>
                {t('whatsapp.createAccount')}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t('whatsapp.messagesSent')}</CardDescription>
              <CardTitle className="text-2xl">{statistics.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Send className="h-4 w-4" />
                <span>{t('whatsapp.total')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t('whatsapp.delivered')}</CardDescription>
              <CardTitle className="text-2xl text-green-600">{statistics.delivered}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{t('whatsapp.success')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t('whatsapp.failed')}</CardDescription>
              <CardTitle className="text-2xl text-red-600">{statistics.failed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>{t('whatsapp.errors')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t('whatsapp.successRate')}</CardDescription>
              <CardTitle className="text-2xl">{statistics.successRate.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="h-4 w-4" />
                <span>{t('whatsapp.performance')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">
            <Send className="h-4 w-4 mr-2" />
            {t('whatsapp.tabTest')}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Bell className="h-4 w-4 mr-2" />
            {t('whatsapp.tabTemplates')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Settings className="h-4 w-4 mr-2" />
            {t('whatsapp.tabNotifications')}
          </TabsTrigger>
          <TabsTrigger value="widget">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('whatsapp.tabWidget')}
          </TabsTrigger>
        </TabsList>

        {/* Test Message */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>{t('whatsapp.testTitle')}</CardTitle>
              <CardDescription>
                {t('whatsapp.testDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('whatsapp.phoneLabel')}</label>
                <Input
                  placeholder="+2250709876543"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {t('whatsapp.phoneHint')}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('whatsapp.messageLabel')}</label>
                <Textarea
                  placeholder="Bonjour! Ceci est un message test..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleSendTestMessage} disabled={!config?.configured}>
                <Send className="h-4 w-4 mr-2" />
                {t('whatsapp.sendTest')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Messages</CardTitle>
              <CardDescription>
                Messages pré-configurés pour les notifications automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Nouvelle Commande',
                    icon: ShoppingCart,
                    template: 'order_confirmation',
                    description: 'Notification automatique pour chaque nouvelle commande',
                    example: '🎉 Nouvelle commande #1234\nClient: Jean Kouassi\nMontant: 15,000 CFA',
                  },
                  {
                    name: 'Paiement Confirmé',
                    icon: CheckCircle,
                    template: 'payment_confirmed',
                    description: 'Confirmation après réception du paiement',
                    example: '✅ Paiement confirmé\nMontant: 15,000 CFA\nRéférence: OM20251018...',
                  },
                  {
                    name: 'Stock Faible',
                    icon: AlertTriangle,
                    template: 'low_stock_alert',
                    description: 'Alerte quand un produit est presque en rupture',
                    example: '⚠️ Alerte Stock Faible\nProduit: T-shirt Rouge M\nStock: 3 restants',
                  },
                  {
                    name: 'Bienvenue',
                    icon: MessageSquare,
                    template: 'welcome_message',
                    description: 'Message de bienvenue pour nouveaux clients',
                    example: '👋 Bonjour Jean!\nBienvenue chez Ma Boutique 🎉',
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm whitespace-pre-line">
                              {item.example}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{item.template}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Automatiques</CardTitle>
              <CardDescription>
                Configuration des notifications WhatsApp automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Nouvelles commandes', enabled: true },
                  { name: 'Paiements reçus', enabled: true },
                  { name: 'Stock faible', enabled: true },
                  { name: 'Nouveaux clients', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.enabled ? 'Activé' : 'Désactivé'}
                      </p>
                    </div>
                    <Button variant={item.enabled ? 'default' : 'outline'} size="sm">
                      {item.enabled ? 'Actif' : 'Inactif'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Widget */}
        <TabsContent value="widget">
          <Card>
            <CardHeader>
              <CardTitle>Widget de Chat WhatsApp</CardTitle>
              <CardDescription>
                Ajoutez un bouton WhatsApp sur votre site web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                <p className="font-medium mb-2">Prévisualisation:</p>
                <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 h-32">
                  <div className="absolute bottom-4 right-4">
                    <Button className="bg-[#25D366] hover:bg-[#20BA5A] rounded-full shadow-lg">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Code HTML à intégrer:</p>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`<a href="https://wa.me/${config?.businessNumber || 'VOTRE_NUMERO'}" 
   target="_blank" 
   style="position:fixed;bottom:20px;right:20px;
          background:#25D366;color:white;padding:15px;
          border-radius:50px;text-decoration:none;">
  💬 WhatsApp
</a>`}
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyWidgetCode}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Ce code sera automatiquement intégré dans les sites web que vous générez pour vos clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
