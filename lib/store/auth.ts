import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  loading: boolean;
  init: () => Promise<void>;
};

async function ensureProfile(user: User): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
  if (error) {
    console.warn('Failed to upsert profile for', user.id, error);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAnonymous: true,
  loading: true,

  // Signs every first-time visitor in anonymously so wishlist/cart RLS policies
  // (which key off auth.uid()) work before Phase 5's real OTP login exists.
  // Phase 5 attaches a phone number to this same session — it must never call
  // signInAnonymously() again.
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

    if (session?.user) {
      await ensureProfile(session.user);
    }

    set({
      session,
      user: session?.user ?? null,
      isAnonymous: session?.user?.is_anonymous ?? true,
      loading: false,
    });

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({
        session: nextSession,
        user: nextSession?.user ?? null,
        isAnonymous: nextSession?.user?.is_anonymous ?? true,
      });
    });
  },
}));
