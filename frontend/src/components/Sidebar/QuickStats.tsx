import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function QuickStats() {
  const stats = [
    {
      icon: DollarSign,
      label: 'Revenus',
      value: '2.45 TND',
      trend: '+12%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: ShoppingCart,
      label: 'Commandes',
      value: '48',
      trend: '+8%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: 'Clients',
      value: '156',
      trend: '+23%',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="px-3 py-4 space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase px-2">
        Statistiques Rapides
      </h3>
      
      <div className="space-y-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                    <span className="text-xs text-green-600 font-medium">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
