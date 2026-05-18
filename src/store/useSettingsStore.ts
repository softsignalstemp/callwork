import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  hydrated: boolean;
  toggleDarkMode: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const DARK_MODE_KEY = 'callwork:darkMode';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  darkMode: false,
  hydrated: false,

  toggleDarkMode: async () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('[settings] failed to persist darkMode:', e);
    }
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'boolean') {
          set({ darkMode: parsed });
        }
      }
    } catch {
      // ignore read errors, use default
    } finally {
      set({ hydrated: true });
    }
  },
}));
