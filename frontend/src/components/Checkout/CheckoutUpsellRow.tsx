import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { UpsellProduct } from '@/lib/checkoutApi';

type CheckoutUpsellRowProps = {
  products: UpsellProduct[];
  onAdd: (productId: string) => void;
  loading?: boolean;
};

export const CheckoutUpsellRow: React.FC<CheckoutUpsellRowProps> = ({
  products,
  onAdd,
  loading,
}) => {
  const { formatPrice } = useCurrency();

  if (!products.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Complétez votre commande</p>
      <div className="grid gap-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-lg border p-3 bg-card"
          >
            {p.image ? (
              <img src={p.image} alt={p.title} className="h-12 w-12 rounded object-cover" />
            ) : (
              <div className="h-12 w-12 rounded bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.title}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => onAdd(p.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
