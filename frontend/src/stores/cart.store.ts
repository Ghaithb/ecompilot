import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  setCartId: (id: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  getTotals: () => { subtotal: number; itemsCount: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );
          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += newItem.quantity;
            return { items: newItems, isOpen: true }; // Open cart on add
          }
          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [], cartId: null }),
      
      setCartId: (cartId) => set({ cartId }),
      
      setIsOpen: (isOpen) => set({ isOpen }),

      getTotals: () => {
        const { items } = get();
        return {
          subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
          itemsCount: items.reduce((count, item) => count + item.quantity, 0),
        };
      },
    }),
    {
      name: 'ecompilot-cart-storage',
    }
  )
);
