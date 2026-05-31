import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SalesChart() {
  // Données de ventes simulées pour les 7 derniers jours
  const salesData = [
    { day: 'Lun', amount: 320 },
    { day: 'Mar', amount: 450 },
    { day: 'Mer', amount: 380 },
    { day: 'Jeu', amount: 520 },
    { day: 'Ven', amount: 680 },
    { day: 'Sam', amount: 750 },
    { day: 'Dim', amount: 620 },
  ];

  const maxAmount = Math.max(...salesData.map(d => d.amount));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <CardTitle>Ventes de la Semaine</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              7 derniers jours
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">3.72 TND</span>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +15.3%
            </span>
            <span className="text-sm text-gray-500">vs semaine précédente</span>
          </div>

          {/* Chart */}
          <div className="flex items-end justify-between gap-2 h-48 pt-4">
            {salesData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden group cursor-pointer hover:opacity-80 transition-opacity">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500"
                    style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute inset-x-0 -top-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded text-center">
                        {data.amount} TND
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{data.day}</span>
              </div>
            ))}
          </div>

          {/* Légende */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-gray-600">Ventes</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Moyenne: <span className="font-semibold text-gray-900">531.00 TND/jour</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
