import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
  TouchableOpacity, ImageBackground,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { useAuthStore } from '@/store/useAuthStore';
import { DecorShape } from '@/components/ui/DecorShape';
import { LOGO_SVG } from '@/constants/logo';
import { Colors } from '@/constants/colors';

const BG = require('../../assets/bg-violet.avif');

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
    if (!email.trim() || !password) { setError('Inserisci email e password.'); return; }
    const err = await signIn(email.trim().toLowerCase(), password);
    if (err) setError(err);
  };

  const inputTheme = {
    colors: {
      primary: Colors.primary,
      outline: Colors.border,
      onSurfaceVariant: Colors.textSecondary,
      background: Colors.card + 'CC',
    },
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Full-screen background texture */}
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        {/* Dark overlay so text is readable */}
        <LinearGradient
          colors={['rgba(7,7,15,0.45)', 'rgba(7,7,15,0.85)', Colors.bg]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </ImageBackground>

      {/* Decorative shapes — absolute, behind content */}
      <DecorShape shape="shard" size={160} color={Colors.primary} opacity={0.22} rotate={-20}
        style={styles.shardTR} />
      <DecorShape shape="shard" size={90} color={Colors.primaryGlow} opacity={0.15} rotate={140}
        style={styles.shardBL} />
      <DecorShape shape="quad" size={64} color={Colors.confirmed} opacity={0.2} rotate={45}
        style={styles.quadMid} />
      <DecorShape shape="blob" size={110} color={Colors.primary} opacity={0.12} rotate={30}
        style={styles.blobBR} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <SvgXml xml={LOGO_SVG} width={260} height={100} />
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
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 12, gap: 28 },

  // Decorative shapes (absolute)
  shardTR: { position: 'absolute', top: 60, right: -24 },
  shardBL: { position: 'absolute', bottom: 200, left: -20 },
  quadMid: { position: 'absolute', top: '38%', right: 28 },
  blobBR: { position: 'absolute', bottom: 120, right: -28 },

  brand: { alignItems: 'center', gap: 8 },
  tagline: { color: Colors.textSecondary, fontSize: 14 },

  card: {
    backgroundColor: Colors.card + 'EE',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  cardTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  input: { backgroundColor: Colors.card + 'CC' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.error + '18', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.error + '44',
  },
  errorText: { color: Colors.error, fontSize: 13, flex: 1 },
  btn: { borderRadius: 14, marginTop: 4 },

  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  switchText: { color: Colors.textSecondary, fontSize: 14 },
  switchLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
