import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in the values.',
  );
}

// `expo start --web` / `web.output: 'static'` server-renders this module in Node,
// where there is no `window`. AsyncStorage's web shim needs `window.localStorage`
// and throws synchronously if used there, and an auto-refresh timer with nowhere
// to persist a session is pointless anyway — so both are skipped for that render
// and left on for native and real-browser runs, matching the Phase 1 spec.
const isServer = Platform.OS === 'web' && typeof window === 'undefined';

// createClient() constructs a realtime client eagerly, and on Node < 22 (no global
// WebSocket) that throws even though nothing here uses realtime subscriptions.
// `ws` stands in for that render only; native and browser runs already have a
// real WebSocket global and never touch this branch.
if (isServer && typeof globalThis.WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic, server-only
  globalThis.WebSocket = require('ws');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: isServer
    ? { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    : {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
});
