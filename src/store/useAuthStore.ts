import { create } from 'zustand';
import type { Session, Subscription, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithIdToken: (provider: 'apple' | 'google', token: string, nonce?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

let authSubscription: Subscription | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    authSubscription?.unsubscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        set({ session, user: session?.user ?? null });
      } else if (event === 'SIGNED_OUT') {
        set({ session: null, user: null });
      }
    });
    authSubscription = subscription;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        // Refresh token invalid or expired — clear and go to login
        console.warn('[auth] Session restore failed, clearing:', error.message);
        await supabase.auth.signOut();
        set({ session: null, user: null, initialized: true });
        return;
      }

      set({ session, user: session?.user ?? null, initialized: true });
    } catch (e) {
      console.warn('[auth] initialize error:', e);
      try { await supabase.auth.signOut(); } catch {}
      set({ session: null, user: null, initialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return error.message;
      set({ session: data.session, user: data.user });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return error.message;
      // If email confirmation is disabled in Supabase dashboard, session is set immediately
      if (data.session) {
        set({ session: data.session, user: data.user });
        return null;
      }
      // Email confirmation required
      return 'confirm_email';
    } finally {
      set({ loading: false });
    }
  },

  signInWithIdToken: async (provider, token, nonce) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider,
        token,
        ...(nonce ? { nonce } : {}),
      });
      if (error) return error.message;
      set({ session: data.session, user: data.user });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
