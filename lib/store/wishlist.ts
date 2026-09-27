import { create } from 'zustand';

import { isMissingUserError } from '@/lib/errors';
import { getWishlistProductIds, toggleWishlist as toggleWishlistRow } from '@/lib/queries/wishlist';

// Lazy + dynamic: lib/store/auth.ts imports this store (to clear it on sign
// out), so a static import back here would be circular. Only reached when a
// write actually fails with isMissingUserError.
async function recoverStaleSession() {
  const { useAuthStore } = await import('@/lib/store/auth');
  await useAuthStore.getState().signOut();
}

type WishlistState = {
  productIds: string[];
  hydrated: boolean;
  hydrate: (userId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggle: (userId: string, productId: string) => Promise<void>;
  reset: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  hydrated: false,

  hydrate: async (userId) => {
    try {
      const productIds = await getWishlistProductIds(userId);
      set({ productIds, hydrated: true });
    } catch (error) {
      console.warn('Failed to load wishlist', error);
      set({ hydrated: true });
    }
  },

  isWishlisted: (productId) => get().productIds.includes(productId),

  // Optimistic: flips local state immediately, then writes through and rolls
  // back on failure so a PLP card and the PDP for the same product stay in sync.
  toggle: async (userId, productId) => {
    const wasWishlisted = get().isWishlisted(productId);
    set({
      productIds: wasWishlisted
        ? get().productIds.filter((id) => id !== productId)
        : [...get().productIds, productId],
    });

    try {
      await toggleWishlistRow(userId, productId, wasWishlisted);
    } catch (error) {
      console.warn('Failed to sync wishlist toggle', error);
      set({
        productIds: wasWishlisted
          ? [...get().productIds, productId]
          : get().productIds.filter((id) => id !== productId),
      });
      // The session's own user_id no longer exists server-side (e.g. it was
      // pruned) — every future write would fail the same way, so drop it and
      // bootstrap a fresh anonymous session rather than leaving the app stuck.
      if (isMissingUserError(error)) void recoverStaleSession();
    }
  },

  // Called on sign-out: the old session's wishlist belongs to a user_id with no
  // active session anymore. app/_layout.tsx re-hydrates it for the new
  // anonymous session once init() resolves a new user id.
  reset: () => set({ productIds: [], hydrated: false }),
}));
