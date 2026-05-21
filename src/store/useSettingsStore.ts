import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_STRAORDINARI, type StraordinariConfig } from '@/utils/straordinari';

interface SettingsState {
  darkMode: boolean;
  hapticEnabled: boolean;
  hydrated: boolean;
  straordinari: StraordinariConfig;
  toggleDarkMode: () => Promise<void>;
  toggleHaptic: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateStraordinari: (patch: Partial<StraordinariConfig>) => Promise<void>;
}

const DARK_MODE_KEY = 'callwork:darkMode';
const HAPTIC_KEY = 'callwork:hapticEnabled';
const STRAORDINARI_KEY = 'callwork:straordinari';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  darkMode: false,
  hapticEnabled: true,
  hydrated: false,
  straordinari: DEFAULT_STRAORDINARI,

  toggleDarkMode: async () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('[settings] failed to persist darkMode:', e);
    }
  },

  toggleHaptic: async () => {
    const next = !get().hapticEnabled;
    set({ hapticEnabled: next });
    try {
      await AsyncStorage.setItem(HAPTIC_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('[settings] failed to persist hapticEnabled:', e);
    }
  },

  updateStraordinari: async (patch) => {
    const next = { ...get().straordinari, ...patch };
    set({ straordinari: next });
    try {
      await AsyncStorage.setItem(STRAORDINARI_KEY, JSON.stringify(next));
    } catch (e) {
      console.error('[settings] failed to persist straordinari:', e);
    }
  },

  hydrate: async () => {
    try {
      const [storedDark, storedHaptic, storedStr] = await Promise.all([
        AsyncStorage.getItem(DARK_MODE_KEY),
        AsyncStorage.getItem(HAPTIC_KEY),
        AsyncStorage.getItem(STRAORDINARI_KEY),
      ]);

      const updates: Partial<SettingsState> = {};

      if (storedDark !== null) {
        const parsed = JSON.parse(storedDark);
        if (typeof parsed === 'boolean') updates.darkMode = parsed;
      }

      if (storedHaptic !== null) {
        const parsed = JSON.parse(storedHaptic);
        if (typeof parsed === 'boolean') updates.hapticEnabled = parsed;
      }

      if (storedStr !== null) {
        const parsed = JSON.parse(storedStr) as Partial<StraordinariConfig>;
        updates.straordinari = { ...DEFAULT_STRAORDINARI, ...parsed };
      }

      set(updates);
    } catch {
      // ignore read errors, use defaults
    } finally {
      set({ hydrated: true });
    }
  },
}));
