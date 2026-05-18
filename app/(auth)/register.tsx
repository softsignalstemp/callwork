import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ImageBackground, Linking,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useAuthStore } from '@/store/useAuthStore';
import { DecorShape } from '@/components/ui/DecorShape';
import { LOGO_SVG } from '@/constants/logo';
import { Colors } from '@/constants/colors';

const BG = require('../../assets/bg-violet.avif');

const PASSWORD_MIN = 8;

function passwordStrength(p: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (p.length === 0) return { level: 0, label: '', color: Colors.border };
  if (p.length < PASSWORD_MIN) return { level: 1, label: 'Troppo corta', color: Colors.error };
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  if (hasUpper && hasDigit) return { level: 3, label: 'Forte', color: Colors.worked };
  if (hasUpper || hasDigit) return { level: 2, label: 'Media', color: Colors.available };
  return { level: 2, label: 'Accettabile', color: Colors.available };
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(password);

  const handleRegister = async () => {
    setError(null);
    if (!email.trim()) { setError('Inserisci un indirizzo email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Email non valida.'); return; }
    if (password.length < PASSWORD_MIN) { setError(`La password deve essere di almeno ${PASSWORD_MIN} caratteri.`); return; }
    if (password !== confirm) { setError('Le password non coincidono.'); return; }
    if (!privacyAccepted) { setError('Devi accettare l\'informativa sulla privacy per continuare.'); return; }

    const result = await signUp(email.trim().toLowerCase(), password);
    if (result === 'confirm_email') {
      setSuccess(true);
    } else if (result !== null) {
      setError(result);
    }
    // null = success with immediate session → root layout redirects
  };

  const inputTheme = {
    colors: {
      primary: Colors.primary,
      outline: Colors.border,
      onSurfaceVariant: Colors.textSecondary,
      background: Colors.card,
    },
  };

  if (success) {
    return (
      <View style={[styles.flex, styles.successWrap, { paddingTop: insets.top }]}>
        <View style={styles.successBox}>
          <MaterialCommunityIcons name="email-check-outline" size={56} color={Colors.worked} />
          <Text style={styles.successTitle}>Controlla la tua email</Text>
          <Text style={styles.successText}>
            Ti abbiamo inviato un link di conferma. Aprilo per attivare il tuo account.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.replace('/(auth)/login')}
            buttonColor={Colors.primary}
            textColor="#fff"
            style={styles.btn}
          >
            Torna al login
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,7,15,0.45)', 'rgba(7,7,15,0.85)', Colors.bg]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </ImageBackground>

      <DecorShape shape="clover" size={120} color="#fb7185" opacity={0.15} rotate={15} style={styles.cloverTL} />
      <DecorShape shape="shard" size={80} color={Colors.primary} opacity={0.18} rotate={60} style={styles.shardBR} />
      <DecorShape shape="flower" size={70} color="#fbbf24" opacity={0.13} rotate={20} style={styles.flowerMid} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.brand}>
          <SvgXml xml={LOGO_SVG} width={220} height={85} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crea account</Text>

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

          <View style={{ gap: 6 }}>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPass}
              autoCapitalize="none"
              textContentType="newPassword"
              textColor={Colors.text}
              style={styles.input}
              theme={inputTheme}
              left={<TextInput.Icon icon="lock-outline" color={() => Colors.textSecondary} />}
              right={
                <TextInput.Icon
                  icon={showPass ? 'eye-off-outline' : 'eye-outline'}
                  color={() => Colors.textMuted}
                  onPress={() => setShowPass(v => !v)}
                />
              }
            />
            {/* Password strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: i <= strength.level ? strength.color : Colors.border },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
              </View>
            )}
          </View>

          <TextInput
            label="Conferma password"
            value={confirm}
            onChangeText={setConfirm}
            mode="outlined"
            secureTextEntry={!showPass}
            autoCapitalize="none"
            textContentType="newPassword"
            textColor={Colors.text}
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="lock-check-outline" color={() => Colors.textSecondary} />}
          />

          {/* Privacy checkbox */}
          <TouchableOpacity
            onPress={() => setPrivacyAccepted(v => !v)}
            activeOpacity={0.75}
            style={styles.privacyRow}
          >
            <View style={[
              styles.checkbox,
              privacyAccepted && { backgroundColor: Colors.primary, borderColor: Colors.primary },
            ]}>
              {privacyAccepted && (
                <MaterialCommunityIcons name="check" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.privacyText}>
              Ho letto e accetto l'
              <Text
                style={styles.privacyLink}
                onPress={() => Linking.openURL('https://privacy.callwork.softsignals.it')}
              >
                informativa sulla privacy
              </Text>
            </Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            buttonColor={Colors.primary}
            textColor="#fff"
            style={[styles.btn, { opacity: privacyAccepted ? 1 : 0.45 }]}
            contentStyle={{ paddingVertical: 6 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Crea account
          </Button>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Hai già un account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.switchLink}>Accedi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 12, gap: 24 },

  cloverTL: { position: 'absolute', top: 70, left: -30 },
  shardBR: { position: 'absolute', bottom: 180, right: -16 },
  flowerMid: { position: 'absolute', top: '42%', left: 20 },

  brand: { alignItems: 'center' },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  cardTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  input: { backgroundColor: Colors.card },

  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '600', minWidth: 70, textAlign: 'right' },

  privacyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  privacyText: { color: Colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 20 },
  privacyLink: { color: Colors.primary, fontWeight: '600' },

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

  // Success state
  successWrap: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  successBox: { alignItems: 'center', gap: 16, maxWidth: 320 },
  successTitle: { color: Colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  successText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
