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

// Non lanciamo eccezione a livello modulo — un throw nell'import
// avviene prima che React si avvii e non viene catturato dall'ErrorBoundary.
// Il controllo avviene in useAuthStore.initialize()
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[CallWork] Supabase credentials missing!\n',
    'URL:', supabaseUrl || 'EMPTY',
    'KEY:', supabaseAnonKey ? '[set]' : 'EMPTY',
    'extra keys:', Object.keys(extra).join(', ')
  );
}

// Crea il client anche con valori vuoti — fallirà gracefully nelle chiamate auth
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
