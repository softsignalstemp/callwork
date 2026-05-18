import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

export function SocialAuthButtons() {
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

  // Apple Sign In è solo iOS
  if (Platform.OS !== 'ios') return null;

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oppure</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        onPress={handleApple}
        disabled={loading}
        activeOpacity={0.8}
        style={styles.appleBtn}
      >
        <MaterialCommunityIcons name="apple" size={20} color="#fff" />
        <Text style={styles.appleLabel}>Continua con Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 12 },

  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  appleLabel: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
