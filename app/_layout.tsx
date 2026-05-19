import 'react-native-url-polyfill/auto';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { darkTheme, lightTheme } from '@/theme';
import { initDb } from '@/db/schema';
import { useLavoriStore } from '@/store/useLavoriStore';
import { Colors } from '@/constants/colors';

function useAuthRedirect() {
  const { session, initialized } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuth = segments[0] === '(auth)';

    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && inAuth) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);
}

export default function RootLayout() {
  const { darkMode, hydrate } = useSettingsStore();
  const { initialize, initialized } = useAuthStore();
  const caricaDati = useLavoriStore((s) => s.caricaDati);

  useEffect(() => {
    hydrate();
    initDb();
    caricaDati();
    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useAuthRedirect();

  const theme = darkMode === false ? lightTheme : darkTheme;

  // Show spinner until auth state is resolved (avoids flash of wrong screen)
  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="lavori/registra"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Registra turno',
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
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
