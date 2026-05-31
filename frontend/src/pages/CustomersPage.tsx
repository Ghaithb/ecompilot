import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Plus, TrendingUp, UserCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { customersApi, type Customer } from '@/lib/customersApi';
import { toast } from 'sonner';
import { EmptyState, EmptyUsersIllustration } from '@/components/ui/empty-state';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [page, search]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersApi.getAll({
        page,
        limit: 20,
        search: search || undefined,
      });
      setCustomers(response.customers);
      setTotal(response.total);
    } catch (error: any) {
      console.error('Error loading customers:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await customersApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND',
    }).format(amount);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const statsCards = [
    { label: 'Total Clients', value: stats.totalCustomers.toString(), icon: Users, color: '#3b82f6' },
    { label: 'Nouveaux ce mois', value: stats.newThisMonth.toString(), icon: Plus, color: '#10b981' },
    { label: 'Clients actifs', value: stats.activeCustomers.toString(), icon: UserCheck, color: '#f59e0b' },
    { 
      label: 'Taux d\'activité', 
      value: stats.totalCustomers > 0 
        ? `${Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}%` 
        : '0%', 
      icon: TrendingUp, 
      color: '#8b5cf6' 
    },
  ];

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Gérez votre base de clients et leurs commandes</p>
        </div>
        <Button>
          <Plus size={20} />
          Nouveau Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher un client (nom, email, entreprise)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => (
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

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            {total} client{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun client"
              description={search ? "Aucun client ne correspond à votre recherche" : "Vos premiers clients apparaîtront ici après leur première commande"}
              illustration={<EmptyUsersIllustration />}
              action={search ? {
                label: "Effacer la recherche",
                onClick: () => setSearch('')
              } : undefined}
            />
          ) : (
            <>
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {customer.firstName} {customer.lastName}
                          {customer.company && <span className="text-gray-500 text-sm ml-2">({customer.company})</span>}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {customer.email}
                          </span>
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {customer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Commandes</div>
                        <div className="font-semibold">{customer.stats.totalOrders || 0}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total dépensé</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(customer.stats.totalSpent || 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Dernière commande</div>
                        <div className="font-semibold">
                          {formatDate(customer.stats.lastOrderAt)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : customer.status === 'inactive'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {customer.status === 'active' ? 'Actif' : customer.status === 'inactive' ? 'Inactif' : 'Bloqué'}
                        </span>
                        {(customer as any).codTrust?.level && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            (customer as any).codTrust.level === 'trusted' ? 'bg-blue-100 text-blue-700'
                            : (customer as any).codTrust.level === 'suspect' ? 'bg-orange-100 text-orange-700'
                            : (customer as any).codTrust.level === 'blocked' ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            COD: {(customer as any).codTrust.level} ({(customer as any).codTrust.score ?? 70})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {total > 20 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} sur {Math.ceil(total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / 20)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <style>{`
        .customers-page {
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
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: #6b7280;
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

export default CustomersPage;
