import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function CartIcon() {
  const navigate = useNavigate();
  const { itemCount, total, cart, isEmpty } = useCart();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {isEmpty ? (
          <div className="p-4 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div className="p-4">
              <h3 className="font-semibold mb-3">
                Mon Panier ({itemCount} article{itemCount > 1 ? 's' : ''})
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart?.items.slice(0, 3).map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × {item.price.toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      {item.subtotal.toFixed(2)}€
                    </div>
                  </div>
                ))}
                
                {cart && cart.items.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    + {cart.items.length - 3} autre{cart.items.length - 3 > 1 ? 's' : ''} article{cart.items.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{total.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            <div className="p-2">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigate('/cart')}
              >
                Voir le panier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer font-semibold"
                onClick={() => navigate('/checkout')}
              >
                Passer la commande
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
