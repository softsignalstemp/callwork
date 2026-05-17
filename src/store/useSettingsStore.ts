import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  hydrated: boolean;
  toggleDarkMode: () => void;
  hydrate: () => Promise<void>;
}

const DARK_MODE_KEY = 'callwork:darkMode';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  darkMode: false,
  hydrated: false,

  toggleDarkMode: async () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) {
        set({ darkMode: JSON.parse(stored) });
      }
    } catch {
      // ignore
    } finally {
      set({ hydrated: true });
    }
  },
}));
