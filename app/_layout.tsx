import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { lightTheme, darkTheme } from '@/theme';
import { initDb } from '@/db/schema';
import { useLavoriStore } from '@/store/useLavoriStore';

export default function RootLayout() {
  const { darkMode, hydrate } = useSettingsStore();
  const caricaDati = useLavoriStore((s) => s.caricaDati);

  useEffect(() => {
    hydrate();
    initDb();
    caricaDati();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={darkMode ? darkTheme : lightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lavori/registra" options={{ presentation: 'modal', headerShown: true, title: 'Registra lavoro' }} />
          <Stack.Screen name="lavori/nuovo-datore" options={{ presentation: 'modal', headerShown: true, title: 'Nuovo datore' }} />
          <Stack.Screen name="lavori/[id]" options={{ presentation: 'modal', headerShown: true, title: 'Dettaglio sessione' }} />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
