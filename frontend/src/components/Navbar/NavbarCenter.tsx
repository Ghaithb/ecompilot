import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NavbarCenter() {
  const quickStats = [
    {
      icon: DollarSign,
      label: 'Revenus',
      value: '2.45 TND',
      change: '+12%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: ShoppingBag,
      label: 'Commandes',
      value: '48',
      change: '+8',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: 'Clients',
      value: '156',
      change: '+23',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="flex items-center gap-4 px-6">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className={`p-1.5 rounded ${stat.bgColor}`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                <span className={`text-xs font-medium ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
