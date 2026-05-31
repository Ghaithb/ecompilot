import { Store, CreditCard, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const POSPage = () => {
  const stats = [
    { label: 'Ventes aujourd\'hui', value: '1.23 TND', icon: TrendingUp, color: '#3b82f6' },
    { label: 'Transactions', value: '45', icon: CreditCard, color: '#10b981' },
    { label: 'Produits vendus', value: '128', icon: Package, color: '#f59e0b' },
    { label: 'Boutiques', value: '3', icon: Store, color: '#8b5cf6' },
  ];

  const recentSales = [
    { id: 1, time: '14:32', items: 3, total: '89.99 TND', payment: 'Carte' },
    { id: 2, time: '14:15', items: 1, total: '45.00 TND', payment: 'Espèces' },
    { id: 3, time: '13:58', items: 5, total: '156.50 TND', payment: 'Carte' },
  ];

  return (
    <div className="pos-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Point de Vente</h1>
          <p className="page-subtitle">Gérez vos ventes en magasin physique</p>
        </div>
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          <CreditCard size={20} />
          Nouvelle vente
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: `${stat.color}22`, color: stat.color }}
                >
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes récentes</CardTitle>
            <CardDescription>Transactions du jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CreditCard className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold">{sale.time}</div>
                      <div className="text-sm text-gray-600">
                        {sale.items} article{sale.items > 1 ? 's' : ''} • {sale.payment}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-lg">{sale.total}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Emplacements</CardTitle>
            <CardDescription>Vos boutiques physiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="text-purple-600" size={24} />
                  <div>
                    <div className="font-semibold">Boutique Paris Centre</div>
                    <div className="text-sm text-gray-600">123 Rue de Rivoli, 75001 Paris</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Ouvert
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Store className="text-purple-600" size={24} />
                  <div>
                    <div className="font-semibold">Boutique Lyon</div>
                    <div className="text-sm text-gray-600">45 Rue de la République, 69002 Lyon</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Ouvert
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Info */}
      <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <Store className="text-purple-600 mt-1" size={32} />
            <div>
              <h3 className="font-semibold text-purple-900 text-xl mb-3">
                Unifiez vente en ligne et en magasin
              </h3>
              <p className="text-purple-700 mb-4">
                Synchronisez automatiquement votre inventaire, gérez vos clients et
                suivez vos ventes sur tous vos canaux de distribution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-900 mb-1">✓ Stock synchronisé</div>
                  <div className="text-sm text-purple-700">En temps réel</div>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-900 mb-1">✓ Multi-paiements</div>
                  <div className="text-sm text-purple-700">Carte, espèces, mobile</div>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-900 mb-1">✓ Rapports unifiés</div>
                  <div className="text-sm text-purple-700">Analytics complètes</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .pos-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default POSPage;
