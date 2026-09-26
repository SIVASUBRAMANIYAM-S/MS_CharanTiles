import { create } from 'zustand';

import type { ShippingAddress } from '@/lib/queries/orders';

type CheckoutState = {
  address: ShippingAddress | null;
  setAddress: (address: ShippingAddress) => void;
  reset: () => void;
};

// Deliberately not persisted — a half-finished checkout shouldn't survive an
// app restart, and the address is cheap for the user to re-enter.
export const useCheckoutStore = create<CheckoutState>((set) => ({
  address: null,
  setAddress: (address) => set({ address }),
  reset: () => set({ address: null }),
}));
