import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Inserisci email e password.');
      return;
    }
    const err = await signIn(email.trim().toLowerCase(), password);
    if (err) setError(err);
    // On success, root layout will redirect to (tabs) automatically
  };

  const inputTheme = {
    colors: {
      primary: Colors.primary,
      outline: Colors.border,
      onSurfaceVariant: Colors.textSecondary,
      background: Colors.card,
    },
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background glow */}
        <LinearGradient
          colors={[Colors.primaryMuted + 'AA', 'transparent']}
          style={styles.bgGlow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
        />

        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="briefcase-clock" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>CallWork</Text>
          <Text style={styles.tagline}>Tieni traccia dei tuoi turni</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accedi</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            textColor={Colors.text}
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="email-outline" color={() => Colors.textSecondary} />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            textColor={Colors.text}
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="lock-outline" color={() => Colors.textSecondary} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                color={() => Colors.textMuted}
                onPress={() => setShowPassword(v => !v)}
              />
            }
          />

          {error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            buttonColor={Colors.primary}
            textColor="#fff"
            style={styles.btn}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Accedi
          </Button>
        </View>

        {/* Switch to register */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Non hai un account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.switchLink}>Registrati</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, gap: 24 },

  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },

  brand: { alignItems: 'center', gap: 8 },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  appName: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  tagline: { color: Colors.textSecondary, fontSize: 14 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    gap: 14,
  },
  cardTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  input: { backgroundColor: Colors.card },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error + '18',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.error + '44',
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },

  btn: { borderRadius: 14, marginTop: 4 },

  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  switchText: { color: Colors.textSecondary, fontSize: 14 },
  switchLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
