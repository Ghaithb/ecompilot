import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, Tag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTND } from '@/lib/currency';

export function ShoppingCart() {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    isEmpty,
    itemCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (error) {
      // Error handled by useCart
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CartIcon className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats</p>
            <Button onClick={() => navigate('/products')}>
              Découvrir nos produits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CartIcon className="w-8 h-8" />
          Mon Panier ({itemCount} article{itemCount > 1 ? 's' : ''})
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          <Trash2 className="w-4 h-4 mr-2" />
          Vider le panier
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des articles */}
        <div className="lg:col-span-2 space-y-4">
          {cart?.items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}

                  {/* Infos produit */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">{formatTND(item.price)}</p>
                    
                    {/* Options */}
                    {item.options && Object.keys(item.options).length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        {Object.entries(item.options).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantité */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={loading}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId)}
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Sous-total */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatTND(item.subtotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Résumé */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Code promo */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Code promo
                </label>
                {cart?.couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {cart.couponCode}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                    >
                      Retirer
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="PROMO10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || applyingCoupon}
                    >
                      {applyingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Appliquer'
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Totaux */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">
                    {formatTND(cart?.totals.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%):</span>
                  <span className="font-medium">
                    {formatTND(cart?.totals.tax)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison:</span>
                  <span className="font-medium">
                    {cart?.totals.shipping === 0 ? (
                      <span className="text-green-600 font-semibold">GRATUITE</span>
                    ) : (
                      formatTND(cart?.totals.shipping)
                    )}
                  </span>
                </div>

                {cart?.totals.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Réduction:</span>
                    <span className="font-medium">
                      -{formatTND(cart.totals.discount)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatTND(cart?.totals.total)}
                  </span>
                </div>
              </div>

              {/* Info livraison gratuite */}
              {cart && cart.totals.subtotal < 50 && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="text-blue-800">
                    🚚 Plus que <strong>{formatTND(50 - cart.totals.subtotal)}</strong> pour la livraison gratuite !
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                Passer la commande
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/products')}
              >
                Continuer mes achats
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
