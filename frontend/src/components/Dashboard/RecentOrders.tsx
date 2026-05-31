import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatTND } from '@/lib/currency';

export function RecentOrders() {
  const orders = [
    {
      id: '#1234',
      customer: 'Marie Dupont',
      items: 3,
      total: 145.90,
      status: 'pending',
      statusLabel: 'En attente',
      time: 'Il y a 5 min',
    },
    {
      id: '#1233',
      customer: 'Jean Martin',
      items: 1,
      total: 89.00,
      status: 'processing',
      statusLabel: 'En cours',
      time: 'Il y a 23 min',
    },
    {
      id: '#1232',
      customer: 'Sophie Bernard',
      items: 5,
      total: 234.50,
      status: 'shipped',
      statusLabel: 'Expédiée',
      time: 'Il y a 1h',
    },
    {
      id: '#1231',
      customer: 'Pierre Dubois',
      items: 2,
      total: 167.80,
      status: 'delivered',
      statusLabel: 'Livrée',
      time: 'Il y a 2h',
    },
    {
      id: '#1230',
      customer: 'Claire Petit',
      items: 4,
      total: 198.20,
      status: 'delivered',
      statusLabel: 'Livrée',
      time: 'Il y a 3h',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <CardTitle>Commandes Récentes</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {order.id}
                  </span>
                  <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                    {order.statusLabel}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {order.customer} • {order.items} article{order.items > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{order.time}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {formatTND(order.total, 2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Voir
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Aujourd'hui</p>
              <p className="text-lg font-bold text-gray-900">12</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Cette semaine</p>
              <p className="text-lg font-bold text-gray-900">48</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ce mois</p>
              <p className="text-lg font-bold text-gray-900">187</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
