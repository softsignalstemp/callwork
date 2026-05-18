import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

WebBrowser.maybeCompleteAuthSession();

// ─── Apple ───────────────────────────────────────────────────────────────────

function AppleButton() {
  const { signInWithIdToken, loading } = useAuthStore();

  const handleApple = async () => {
    try {
      const rawNonce = Math.random().toString(36).slice(2);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        Alert.alert('Errore', 'Apple non ha restituito un token valido.');
        return;
      }

      const err = await signInWithIdToken('apple', credential.identityToken, rawNonce);
      if (err) Alert.alert('Errore accesso Apple', err);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Errore', 'Accesso con Apple non riuscito.');
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handleApple}
      disabled={loading}
      activeOpacity={0.8}
      style={[styles.btn, styles.appleBtn]}
    >
      <MaterialCommunityIcons name="apple" size={20} color="#fff" />
      <Text style={[styles.btnLabel, { color: '#fff' }]}>Continua con Apple</Text>
    </TouchableOpacity>
  );
}

// ─── Google ──────────────────────────────────────────────────────────────────

function GoogleButton() {
  const { signInWithIdToken, loading } = useAuthStore();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        signInWithIdToken('google', idToken).then((err) => {
          if (err) Alert.alert('Errore accesso Google', err);
        });
      }
    } else if (response?.type === 'error') {
      Alert.alert('Errore', response.error?.message ?? 'Accesso Google non riuscito.');
    }
  }, [response]);

  return (
    <TouchableOpacity
      onPress={() => promptAsync()}
      disabled={!request || loading}
      activeOpacity={0.8}
      style={[styles.btn, styles.googleBtn]}
    >
      {/* Google G logo via text — avoids external asset */}
      <Text style={styles.googleG}>G</Text>
      <Text style={[styles.btnLabel, { color: Colors.text }]}>Continua con Google</Text>
    </TouchableOpacity>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

export function SocialAuthButtons() {
  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oppure</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttons}>
        <GoogleButton />
        {Platform.OS === 'ios' && <AppleButton />}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 14 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 12 },

  buttons: { gap: 10 },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  btnLabel: { fontSize: 15, fontWeight: '600' },

  appleBtn: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  googleBtn: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  googleG: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
    width: 20,
    textAlign: 'center',
  },
});
