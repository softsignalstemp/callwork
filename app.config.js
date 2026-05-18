// app.config.js — legge .env.local automaticamente (Expo SDK 49+)
// Le variabili EXPO_PUBLIC_* vengono iniettate nel bundle al build time.

export default {
  expo: {
    name: 'callwork',
    slug: 'callwork',
    scheme: 'callwork',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'cover',
      backgroundColor: '#07070F',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'it.softsignals.callwork',
      usesAppleSignIn: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#07070F',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-sqlite',
      'expo-secure-store',
      '@react-native-community/datetimepicker',
      'expo-web-browser',
      'expo-apple-authentication',
      'expo-font',
    ],
    extra: {
      // Rende le variabili accessibili via Constants.expoConfig.extra
      // come fallback oltre a process.env
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      router: {},
      eas: {
        projectId: '25b01a40-8b94-4318-9c89-36ca51b6bbd5',
      },
    },
    owner: 'softsignals',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/1928f292-9cae-4aa2-9f49-c941ff37b7e6',
    },
  },
};
