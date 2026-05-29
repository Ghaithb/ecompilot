import { Plus, Globe, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MarketsPage = () => {
  const markets = [
    {
      id: 1,
      name: 'France',
      flag: '🇫🇷',
      status: 'active',
      currency: 'EUR',
      customers: 2450,
      revenue: '145,000€',
      growth: '+12%',
    },
    {
      id: 2,
      name: 'Belgique',
      flag: '🇧🇪',
      status: 'active',
      currency: 'EUR',
      customers: 850,
      revenue: '45,000€',
      growth: '+8%',
    },
    {
      id: 3,
      name: 'Côte d\'Ivoire',
      flag: '🇨🇮',
      status: 'pending',
      currency: 'XOF',
      customers: 120,
      revenue: '5,000€',
      growth: '+25%',
    },
  ];

  const stats = [
    { label: 'Marchés actifs', value: '2', icon: Globe, color: '#3b82f6' },
    { label: 'Devises', value: '3', icon: DollarSign, color: '#10b981' },
    { label: 'Clients internationaux', value: '3,420', icon: Users, color: '#f59e0b' },
    { label: 'Croissance moyenne', value: '+15%', icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <div className="markets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Markets</h1>
          <p className="page-subtitle">Gérez vos marchés internationaux et devises</p>
        </div>
        <Button>
          <Plus size={20} />
          Ajouter un marché
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

      {/* Markets List */}
      <Card>
        <CardHeader>
          <CardTitle>Vos marchés</CardTitle>
          <CardDescription>Pays et régions où vous vendez vos produits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {markets.map((market) => (
              <div
                key={market.id}
                className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{market.flag}</div>
                  <div>
                    <div className="font-semibold text-lg">{market.name}</div>
                    <div className="text-sm text-gray-600">
                      Devise: {market.currency}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Clients</div>
                    <div className="font-semibold text-lg">{market.customers.toLocaleString()}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Revenus</div>
                    <div className="font-semibold text-lg">{market.revenue}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Croissance</div>
                    <div className="font-semibold text-lg text-green-600">{market.growth}</div>
                  </div>
                  
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    market.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {market.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Globe className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Expansion internationale</h3>
              <p className="text-blue-700 text-sm">
                Développez votre business à l'international avec la gestion multi-devises,
                multi-langues et les options de livraison personnalisées par pays.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .markets-page {
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

export default MarketsPage;
