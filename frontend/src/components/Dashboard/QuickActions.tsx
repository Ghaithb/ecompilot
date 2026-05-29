import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, Download, Settings, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: 'Nouveau Produit',
      description: 'Ajouter au catalogue',
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/products/new',
    },
    {
      icon: FileText,
      label: 'Créer Commande',
      description: 'Manuelle ou import',
      color: 'bg-purple-500 hover:bg-purple-600',
      path: '/orders/new',
    },
    {
      icon: Tag,
      label: 'Code Promo',
      description: 'Nouvelle promotion',
      color: 'bg-green-500 hover:bg-green-600',
      path: '/promotions/new',
    },
    {
      icon: Upload,
      label: 'Importer',
      description: 'CSV ou Excel',
      color: 'bg-orange-500 hover:bg-orange-600',
      path: '/import',
    },
    {
      icon: Download,
      label: 'Exporter',
      description: 'Données produits',
      color: 'bg-pink-500 hover:bg-pink-600',
      path: '/export',
    },
    {
      icon: Settings,
      label: 'Paramètres',
      description: 'Configuration',
      color: 'bg-gray-500 hover:bg-gray-600',
      path: '/settings',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
            <span className="text-white text-xs">⚡</span>
          </div>
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
