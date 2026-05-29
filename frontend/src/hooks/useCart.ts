import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
  options?: Record<string, any>;
}

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totals: CartTotals;
  currency: string;
  couponCode?: string;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Récupérer le token
  const getToken = () => localStorage.getItem('auth_token');

  // Charger le panier
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/cart`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur chargement panier');
      }

      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur chargement panier:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Ajouter un produit
  const addToCart = async (
    productId: string,
    quantity: number = 1,
    options?: Record<string, any>
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ productId, quantity, options }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur ajout panier');
      }

      await loadCart();
      toast.success('✅ Produit ajouté au panier');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur ajout panier';
      toast.error(`❌ ${message}`);
      throw err;
    }
  };

  // Mettre à jour la quantité
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/cart/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur mise à jour');
      }

      await loadCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur mise à jour';
      toast.error(`❌ ${message}`);
      throw err;
    }
  };

  // Retirer un produit
  const removeItem = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur suppression');
      }

      await loadCart();
      toast.success('🗑️ Produit retiré');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur suppression';
      toast.error(`❌ ${message}`);
      throw err;
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur vidage panier');
      }

      await loadCart();
      toast.success('🗑️ Panier vidé');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur vidage';
      toast.error(`❌ ${message}`);
      throw err;
    }
  };

  // Appliquer un code promo
  const applyCoupon = async (couponCode: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cart/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ couponCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Code promo invalide');
      }

      await loadCart();
      toast.success('🎟️ Code promo appliqué');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code invalide';
      toast.error(`❌ ${message}`);
      throw err;
    }
  };

  // Retirer le code promo
  const removeCoupon = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cart/coupon`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur retrait code promo');
      }

      await loadCart();
      toast.success('Code promo retiré');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      toast.error(`❌ ${message}`);
      throw err;
    }
  };

  // Charger le panier au montage
  useEffect(() => {
    const token = getToken();
    if (token) {
      loadCart();
    }
  }, [loadCart]);

  return {
    // État
    cart,
    loading,
    error,

    // Actions
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart: loadCart,

    // Helpers
    itemCount: cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    total: cart?.totals.total || 0,
    isEmpty: !cart || cart.items.length === 0,
  };
}
