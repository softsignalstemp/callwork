import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { darkTheme, lightTheme } from '@/theme';
import { initDb } from '@/db/schema';
import { useLavoriStore } from '@/store/useLavoriStore';
import { Colors } from '@/constants/colors';

export default function RootLayout() {
  const { darkMode, hydrate } = useSettingsStore();
  const caricaDati = useLavoriStore((s) => s.caricaDati);

  useEffect(() => {
    hydrate();
    initDb();
    caricaDati();
  }, []);

  // Default to dark theme; respect user toggle
  const theme = darkMode === false ? lightTheme : darkTheme;

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="lavori/registra"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Registra lavoro',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="lavori/nuovo-datore"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Nuovo datore',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.text,
              headerShadowVisible: false,
            }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
