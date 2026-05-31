import { Bell, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RecentActivity() {
  const activities = [
    {
      icon: ShoppingBag,
      title: 'Nouvelle commande',
      description: 'Commande #1234',
      time: 'Il y a 5 min',
      type: 'success' as const,
    },
    {
      icon: Bell,
      title: 'Stock faible',
      description: 'Produit XYZ',
      time: 'Il y a 1h',
      type: 'warning' as const,
    },
    {
      icon: CheckCircle,
      title: 'Paiement reçu',
      description: '250.00 TND',
      time: 'Il y a 2h',
      type: 'success' as const,
    },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="px-3 py-4 space-y-3 border-t border-gray-200">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase">
          Activité Récente
        </h3>
        <Badge variant="secondary" className="text-xs">
          {activities.length}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <Card key={index} className="p-2.5 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex gap-2">
                <div className={`p-1.5 rounded-md ${getIconColor(activity.type)} shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
