import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  extra.supabaseUrl ??
  '';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra.supabaseKey ??
  '';

// Log in production so the ErrorBoundary shows the exact values
if (__DEV__) {
  console.log('[supabase] url:', supabaseUrl ? '✓' : '✗ MISSING');
  console.log('[supabase] key:', supabaseAnonKey ? '✓' : '✗ MISSING');
}

if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    `[CallWork] Supabase credentials missing.\n` +
    `URL: ${supabaseUrl || 'EMPTY'}\n` +
    `KEY: ${supabaseAnonKey ? '[set]' : 'EMPTY'}\n` +
    `extra keys: ${Object.keys(extra).join(', ')}`;
  throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
