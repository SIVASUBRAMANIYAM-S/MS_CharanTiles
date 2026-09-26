import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (productId: string, variantId: string | null, quantity?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  totalCount: () => number;
  clear: () => void;
};

// Local-only this phase (see Phase 4 plan) — synced to Supabase cart_items in Phase 6.
function sameLine(item: CartItem, productId: string, variantId: string | null) {
  return item.productId === productId && item.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, variantId, quantity = 1) => {
        const existing = get().items.find((item) => sameLine(item, productId, variantId));
        if (existing) {
          set({
            items: get().items.map((item) =>
              sameLine(item, productId, variantId)
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          });
        } else {
          set({ items: [...get().items, { productId, variantId, quantity }] });
        }
      },

      removeItem: (productId, variantId) => {
        set({ items: get().items.filter((item) => !sameLine(item, productId, variantId)) });
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((item) =>
            sameLine(item, productId, variantId) ? { ...item, quantity } : item,
          ),
        });
      },

      totalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      // Called on sign-out: the old session's cart belongs to a user_id with no
      // active session anymore. Goes through persist's own `set`, so it clears
      // the AsyncStorage copy too, not just in-memory state.
      clear: () => set({ items: [] }),
    }),
    {
      name: 'mscharantiles.cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
