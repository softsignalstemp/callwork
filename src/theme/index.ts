import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Colors } from '@/constants/colors';

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryMuted,
    secondary: Colors.primaryGlow,
    secondaryContainer: Colors.card,
    background: Colors.bg,
    surface: Colors.surface,
    surfaceVariant: Colors.card,
    onBackground: Colors.text,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.textSecondary,
    onPrimary: '#FFFFFF',
    outline: Colors.border,
    error: Colors.error,
    errorContainer: '#3B1212',
    onError: '#FFFFFF',
  },
};

// Light theme kept for completeness but app defaults to dark
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    background: '#F0EEFF',
    surface: '#FFFFFF',
    onBackground: '#1A0A3D',
    onSurface: '#1A0A3D',
  },
};
