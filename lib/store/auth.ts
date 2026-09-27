import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
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
    .select('id, full_name, phone, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('Failed to load profile for', userId, error);
    return null;
  }
  return data;
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

  // Writes the phone straight to the profiles row of the *current* session —
  // this is identity attachment, not sign-in. See Phase 5 notes: no OTP is
  // actually sent, and supabase.auth.signInWithOtp/updateUser are never used.
  attachPhone: async (phone) => {
    const userId = get().user?.id;
    if (!userId) throw new Error('No active session.');
    const { error } = await supabase.from('profiles').update({ phone }).eq('id', userId);
    if (error) throw error;
    await get().refreshProfile();
  },

  updateFullName: async (name) => {
    const userId = get().user?.id;
    if (!userId) throw new Error('No active session.');
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', userId);
    if (error) throw error;
    await get().refreshProfile();
  },

  // Destroys the anonymous session entirely, so its cart/wishlist (scoped to
  // that user_id) are cleared locally too, then bootstraps a brand new
  // anonymous session with its own fresh profiles row. This POC has no
  // cross-session data merge — signing out genuinely loses the old session's
  // cart and wishlist, which the Profile screen must warn about before calling this.
  //
  // Deliberately leaves `loading` alone: app/_layout.tsx swaps the whole <Stack>
  // for <BrandSplash> while loading is true, which would unmount the navigator
  // mid-sign-out and dump the user back on the Home tab instead of Profile.
  // init() doesn't need loading:true to re-run — its early-return guard checks
  // `session`, which is already cleared below.
  signOut: async () => {
    // profiles.phone is unique, and this POC has no way to sign back into an
    // abandoned anonymous session by phone — so without this, the number
    // stays stuck on the old (now unreachable) account and can never be
    // attached again, even by the same person re-entering it right after.
    const outgoingUserId = get().user?.id;
    if (outgoingUserId) {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: null })
        .eq('id', outgoingUserId);
      if (error) console.warn('Failed to release phone number before sign-out', error);
    }
    await supabase.auth.signOut();
    useCartStore.getState().clear();
    useWishlistStore.getState().reset();
    set({ session: null, user: null, isAnonymous: true, profile: null });
    await get().init();
  },
}));
