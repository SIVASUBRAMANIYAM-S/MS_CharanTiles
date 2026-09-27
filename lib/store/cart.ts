import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isMissingUserError } from '@/lib/errors';
import {
  getCartItems,
  removeCartItem,
  setCartItemQuantity,
  upsertCartItem,
} from '@/lib/queries/cart';

// Lazy + dynamic: lib/store/auth.ts imports this store (to clear it on sign
// out), so a static import back here would be circular. Only reached when a
// write actually fails with isMissingUserError.
async function recoverStaleSession() {
  const { useAuthStore } = await import('@/lib/store/auth');
  await useAuthStore.getState().signOut();
}

export type CartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  /** Pulls the remote cart_items for this session down into local state, or — if
   * this is a cart that was only ever local (e.g. Phase 4/5 data predating sync,
   * or an offline add that hasn't synced yet) — pushes it up instead. */
  hydrate: (userId: string) => Promise<void>;
  addItem: (
    userId: string | undefined,
    productId: string,
    variantId: string | null,
    quantity?: number,
  ) => void;
  removeItem: (userId: string | undefined, productId: string, variantId: string | null) => void;
  updateQuantity: (
    userId: string | undefined,
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  totalCount: () => number;
  clear: () => void;
};

function sameLine(item: CartItem, productId: string, variantId: string | null) {
  return item.productId === productId && item.variantId === variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      hydrate: async (userId) => {
        try {
          const remoteRows = await getCartItems(userId);
          if (remoteRows.length > 0) {
            set({
              items: remoteRows.map((row) => ({
                productId: row.product_id,
                variantId: row.variant_id,
                quantity: row.quantity,
              })),
              hydrated: true,
            });
          } else if (get().items.length > 0) {
            // Local-only cart from before sync existed (or added while offline) — push it up.
            await Promise.all(
              get().items.map((item) =>
                upsertCartItem(userId, item.productId, item.variantId, item.quantity),
              ),
            );
            set({ hydrated: true });
          } else {
            set({ hydrated: true });
          }
        } catch (error) {
          console.warn('Failed to hydrate cart', error);
          set({ hydrated: true });
          // This session's user_id doesn't exist server-side (e.g. this device
          // has a leftover local cart from a session that was later pruned) —
          // pushing it up will never succeed, so start over with a fresh one.
          if (isMissingUserError(error)) void recoverStaleSession();
        }
      },

      // Optimistic: updates local state immediately (and AsyncStorage, via persist),
      // then writes through to cart_items. See lib/store/wishlist.ts for the same pattern.
      addItem: (userId, productId, variantId, quantity = 1) => {
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
        if (userId) {
          upsertCartItem(userId, productId, variantId, quantity).catch((error: unknown) => {
            console.warn('Failed to sync cart add', error);
            if (isMissingUserError(error)) void recoverStaleSession();
          });
        }
      },

      removeItem: (userId, productId, variantId) => {
        set({ items: get().items.filter((item) => !sameLine(item, productId, variantId)) });
        if (userId) {
          removeCartItem(userId, productId, variantId).catch((error: unknown) =>
            console.warn('Failed to sync cart remove', error),
          );
        }
      },

      updateQuantity: (userId, productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(userId, productId, variantId);
          return;
        }
        set({
          items: get().items.map((item) =>
            sameLine(item, productId, variantId) ? { ...item, quantity } : item,
          ),
        });
        if (userId) {
          setCartItemQuantity(userId, productId, variantId, quantity).catch((error: unknown) =>
            console.warn('Failed to sync cart quantity', error),
          );
        }
      },

      totalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      // Called on sign-out: the old session's cart belongs to a user_id with no
      // active session anymore. Goes through persist's own `set`, so it clears
      // the AsyncStorage copy too, not just in-memory state. Remote rows for the
      // old (now sessionless) user are left as-is — harmless, and out of scope
      // for this POC's sign-out to clean up.
      clear: () => set({ items: [], hydrated: false }),
    }),
    {
      name: 'mscharantiles.cart',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
