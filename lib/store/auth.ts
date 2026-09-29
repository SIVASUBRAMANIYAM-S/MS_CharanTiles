import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { supabase } from '@/lib/supabase';
import type { ShippingAddress } from '@/lib/queries/orders';

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  default_address: ShippingAddress | null;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  profile: Profile | null;
  loading: boolean;
  init: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  attachPhone: (phone: string) => Promise<void>;
  updateFullName: (name: string) => Promise<void>;
  saveDefaultAddress: (address: ShippingAddress) => Promise<void>;
  signOut: () => Promise<void>;
};

async function ensureProfile(user: User): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
  if (error) {
    console.warn('Failed to upsert profile for', user.id, error);
  }
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, default_address')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('Failed to load profile for', userId, error);
    return null;
  }
  // jsonb comes back as `Json`, structurally identical to ShippingAddress here —
  // this table only ever gets that shape written to it (see saveDefaultAddress).
  return data as Profile | null;
}

// Subscribed once, at module scope, so signOut() -> init() re-bootstrapping a
// fresh session never stacks up duplicate onAuthStateChange listeners.
let authListenerAttached = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAnonymous: true,
  profile: null,
  loading: true,

  // Signs every first-time visitor in anonymously so wishlist/cart RLS policies
  // (which key off auth.uid()) work before phone identity exists. Phase 5's
  // attachPhone() adds a phone number to this same session — it must never call
  // signInAnonymously() again outside of this init() bootstrap.
  init: async () => {
    if (!get().loading && get().session) return;

    const { data: existing } = await supabase.auth.getSession();
    let session = existing.session;

    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('Anonymous sign-in failed', error);
        set({ loading: false });
        return;
      }
      session = data.session;
    }

    let profile: Profile | null = null;
    if (session?.user) {
      await ensureProfile(session.user);
      profile = await fetchProfile(session.user.id);
    }

    set({
      session,
      user: session?.user ?? null,
      isAnonymous: session?.user?.is_anonymous ?? true,
      profile,
      loading: false,
    });

    if (!authListenerAttached) {
      authListenerAttached = true;
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        set({
          session: nextSession,
          user: nextSession?.user ?? null,
          isAnonymous: nextSession?.user?.is_anonymous ?? true,
        });
      });
    }
  },

  refreshProfile: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    const profile = await fetchProfile(userId);
    set({ profile });
  },

  // "Sign in": claims the phone for the *current* (anonymous) session. If
  // another account already holds the number, the server moves that account's
  // orders, cart, wishlist and details onto this one first (see
  // supabase/migrations/0007_sign_in_with_phone.sql), so signing back in
  // restores them. No OTP is actually sent — see Phase 5 notes.
  attachPhone: async (phone) => {
    const userId = get().user?.id;
    if (!userId) throw new Error('No active session.');
    const { error } = await supabase.rpc('sign_in_with_phone', { p_phone: phone });
    if (error?.code === 'PGRST202') {
      // Migration 0007 not applied yet: fall back to attaching a free number only.
      const fallback = await supabase.from('profiles').update({ phone }).eq('id', userId);
      if (fallback.error) throw fallback.error;
    } else if (error) {
      throw error;
    }
    // Same user id as before, so app/_layout.tsx won't re-hydrate on its own.
    await Promise.all([
      get().refreshProfile(),
      useCartStore.getState().hydrate(userId),
      useWishlistStore.getState().hydrate(userId),
    ]);
  },

  updateFullName: async (name) => {
    const userId = get().user?.id;
    if (!userId) throw new Error('No active session.');
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', userId);
    if (error) throw error;
    await get().refreshProfile();
  },

  // Remembers this address for next time (checkout/address.tsx pre-fills from
  // it). Fire-and-forget from the caller's point of view — a failure here
  // shouldn't block checkout, since the order itself doesn't depend on it.
  saveDefaultAddress: async (address) => {
    const userId = get().user?.id;
    if (!userId) return;
    const { error } = await supabase
      .from('profiles')
      .update({ default_address: address })
      .eq('id', userId);
    if (error) {
      console.warn('Failed to save default address', error);
      return;
    }
    set((state) =>
      state.profile ? { profile: { ...state.profile, default_address: address } } : {},
    );
  },

  // Destroys the anonymous session entirely, so its cart/wishlist are cleared
  // locally too, then bootstraps a brand new anonymous session with its own
  // fresh profiles row. The data itself stays on the old account, keyed by its
  // phone number, until someone signs in with that number again.
  //
  // Deliberately leaves `loading` alone: app/_layout.tsx swaps the whole <Stack>
  // for <BrandSplash> while loading is true, which would unmount the navigator
  // mid-sign-out and dump the user back on the Home tab instead of Profile.
  // init() doesn't need loading:true to re-run — its early-return guard checks
  // `session`, which is already cleared below.
  // Leaves the phone on the outgoing account on purpose: signing in with the
  // same number later finds that account and restores its orders, cart and
  // wishlist (attachPhone -> sign_in_with_phone).
  signOut: async () => {
    await supabase.auth.signOut();
    useCartStore.getState().clear();
    useWishlistStore.getState().reset();
    set({ session: null, user: null, isAnonymous: true, profile: null });
    await get().init();
  },
}));
