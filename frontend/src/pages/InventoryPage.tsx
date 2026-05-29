import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import type { InventorySummary } from '@/types/inventory';
import { inventoryApi } from '@/lib/inventoryApi';
import { Loader2 } from 'lucide-react';

interface InventoryProduct {
  sku: string;
  stock: number;
  history?: Array<{ date: string; movement: string; quantity: number }>;
}

const InventoryPage: React.FC = () => {
  const { data, isLoading } = useQuery<InventorySummary>({
    queryKey: ['inventory-summary'],
    queryFn: inventoryApi.getSummary,
    staleTime: 60_000,
  });

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Synthèse du Stock</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vue centralisée</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <div>
              {data?.platforms?.map((p) => (
                <div key={p.name} className="mb-4">
                  <div className="font-semibold">{p.name}</div>
                  <ul className="ml-4">
                    {(p.products as InventoryProduct[]).map((prod) => (
                      <li key={prod.sku} className="text-sm">
                        SKU: {prod.sku} | Stock: {prod.stock}
                        {prod.stock < 5 && <span className="text-red-500 ml-2">Stock bas</span>}
                        {prod.history && (
                          <span className="ml-2 text-gray-500">Historique: {prod.history.length} mouvements</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;
