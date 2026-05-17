import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Colors } from '@/constants/colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.light.background,
    surface: Colors.light.surface,
    error: Colors.error,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    error: Colors.error,
  },
};
