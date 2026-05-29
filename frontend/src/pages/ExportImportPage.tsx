import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Package,
  Users,
  ShoppingCart,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const ExportImportPage: React.FC = () => {
  const exportOptions = [
    {
      id: 'products',
      name: 'Produits',
      description: 'Exportez votre catalogue de produits complet',
      icon: Package,
      count: '1,247 produits',
      color: 'blue',
    },
    {
      id: 'orders',
      name: 'Commandes',
      description: 'Historique complet des commandes',
      icon: ShoppingCart,
      count: '3,456 commandes',
      color: 'green',
    },
    {
      id: 'customers',
      name: 'Clients',
      description: 'Base de données clients',
      icon: Users,
      count: '892 clients',
      color: 'purple',
    },
    {
      id: 'inventory',
      name: 'Inventaire',
      description: 'Stock et mouvements',
      icon: FileText,
      count: '1,247 articles',
      color: 'orange',
    },
  ];

  const recentExports = [
    { id: 1, type: 'Produits', date: '2024-11-20 14:30', status: 'completed', size: '2.4 MB' },
    { id: 2, type: 'Commandes', date: '2024-11-19 10:15', status: 'completed', size: '1.8 MB' },
    { id: 3, type: 'Clients', date: '2024-11-18 09:00', status: 'completed', size: '456 KB' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            Export / Import
          </h1>
          <p className="text-gray-600 mt-2">
            Importez et exportez vos données en masse
          </p>
        </div>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter les données
          </CardTitle>
          <CardDescription>
            Téléchargez vos données au format CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg ${getColorClasses(option.color)} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{option.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{option.count}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importer les données
          </CardTitle>
          <CardDescription>
            Importez vos données depuis un fichier CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez votre fichier CSV ici
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou cliquez pour sélectionner
              </p>
              <Button variant="outline">
                Parcourir les fichiers
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    Format requis
                  </p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Le fichier doit être au format CSV (UTF-8)</li>
                    <li>• La première ligne doit contenir les en-têtes</li>
                    <li>• Utilisez nos modèles pour garantir la compatibilité</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger modèle Produits
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger modèle Clients
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exports récents</CardTitle>
          <CardDescription>Vos derniers exports de données</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">{exp.type}</p>
                    <p className="text-sm text-gray-600">{exp.date} • {exp.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportImportPage;
