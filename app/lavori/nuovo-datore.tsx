import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLavoriStore } from '@/store/useLavoriStore';
import { formatEuro } from '@/utils/formatters';
import { Colors } from '@/constants/colors';

const COLORI_PRESET = [
  '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E',
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

function SectionLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{text}</Text>
      {required && <Text style={styles.sectionRequired}>*</Text>}
    </View>
  );
}

const inputTheme = {
  colors: {
    primary: Colors.primary,
    outline: Colors.border,
    onSurfaceVariant: Colors.textSecondary,
    background: Colors.card,
  },
};

export default function NuovoDatoreScreen() {
  const router = useRouter();
  const { aggiungiDatore } = useLavoriStore();

  const [nome, setNome] = useState('');
  const [pagaOraria, setPagaOraria] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [colore, setColore] = useState(COLORI_PRESET[0]);

  const salva = () => {
    if (!nome.trim()) {
      Alert.alert('Campo obbligatorio', 'Inserisci il nome del datore di lavoro.');
      return;
    }
    const paga = parseFloat(pagaOraria.replace(',', '.'));
    if (isNaN(paga) || paga <= 0) {
      Alert.alert('Paga non valida', 'Inserisci una paga oraria valida (es. 11.50).');
      return;
    }
    aggiungiDatore({ nome: nome.trim(), pagaOraria: paga, descrizione: descrizione.trim() || undefined, colore });
    router.back();
  };

  const pagaNum = parseFloat(pagaOraria.replace(',', '.'));
  const pagaValida = isFinite(pagaNum) && pagaNum > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

      {/* ── NOME ────────────────────────────────────────── */}
      <SectionLabel text="Nome datore" required />
      <TextInput
        value={nome}
        onChangeText={setNome}
        mode="outlined"
        maxLength={100}
        placeholder="es. Mario Rossi Srl"
        placeholderTextColor={Colors.textMuted}
        textColor={Colors.text}
        style={styles.input}
        theme={inputTheme}
        left={<TextInput.Icon icon="domain" color={() => Colors.primary} />}
        autoCapitalize="words"
      />

      {/* ── PAGA ORARIA ─────────────────────────────────── */}
      <SectionLabel text="Paga oraria" required />
      <TextInput
        value={pagaOraria}
        onChangeText={setPagaOraria}
        mode="outlined"
        placeholder="es. 11.50"
        placeholderTextColor={Colors.textMuted}
        textColor={Colors.text}
        keyboardType="decimal-pad"
        style={styles.input}
        theme={inputTheme}
        left={<TextInput.Icon icon="currency-eur" color={() => Colors.primary} />}
        right={pagaValida ? <TextInput.Affix text="/ora" textStyle={{ color: Colors.textSecondary }} /> : undefined}
      />
      {pagaValida && (
        <Text style={styles.pagaHint}>
          8h al giorno → {formatEuro(pagaNum * 8)} · 40h sett → {formatEuro(pagaNum * 40)}
        </Text>
      )}

      {/* ── COLORE ──────────────────────────────────────── */}
      <SectionLabel text="Colore identificativo" />
      <View style={styles.colorGrid}>
        {COLORI_PRESET.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColore(c)}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              colore === c && {
                borderWidth: 3,
                borderColor: '#fff',
                shadowColor: c,
                shadowOpacity: 0.7,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
                elevation: 8,
              },
            ]}
          >
            {colore === c && (
              <MaterialCommunityIcons name="check" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── DESCRIZIONE ─────────────────────────────────── */}
      <SectionLabel text="Descrizione (opzionale)" />
      <TextInput
        value={descrizione}
        onChangeText={setDescrizione}
        mode="outlined"
        maxLength={500}
        placeholder="Tipo di lavoro, sede, ecc."
        placeholderTextColor={Colors.textMuted}
        textColor={Colors.text}
        multiline
        numberOfLines={3}
        style={styles.input}
        theme={inputTheme}
        left={<TextInput.Icon icon="text" color={() => Colors.textSecondary} />}
      />

      {/* ── PREVIEW CARD ────────────────────────────────── */}
      {nome.trim().length > 0 && (
        <>
          <SectionLabel text="Anteprima" />
          <View style={[styles.preview, { borderColor: colore + '66' }]}>
            <View style={[styles.previewBar, { backgroundColor: colore }]} />
            <View style={styles.previewBody}>
              <Text style={styles.previewNome}>{nome}</Text>
              {descrizione.trim() && (
                <Text style={styles.previewDesc}>{descrizione}</Text>
              )}
              <View style={styles.previewPillRow}>
                <View style={[styles.previewPill, { backgroundColor: colore + '33' }]}>
                  <Text style={[styles.previewPillText, { color: colore }]}>
                    {pagaValida ? `${formatEuro(pagaNum)}/h` : '—/h'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}

      {/* ── AZIONI ──────────────────────────────────────── */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={salva}
          buttonColor={Colors.primary}
          textColor="#fff"
          style={styles.saveBtn}
          contentStyle={{ paddingVertical: 6 }}
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          Salva datore
        </Button>
        <Button onPress={() => router.back()} textColor={Colors.textSecondary}>
          Annulla
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 20, gap: 8, paddingBottom: 40 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16, marginBottom: 6 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionRequired: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  input: { backgroundColor: Colors.card },

  pagaHint: { color: Colors.textMuted, fontSize: 12, marginTop: 4, marginLeft: 4 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  preview: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  previewBar: { width: 4 },
  previewBody: { flex: 1, padding: 14, gap: 4 },
  previewNome: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  previewDesc: { color: Colors.textSecondary, fontSize: 13 },
  previewPillRow: { flexDirection: 'row', marginTop: 4 },
  previewPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  previewPillText: { fontSize: 12, fontWeight: '700' },

  actions: { gap: 8, marginTop: 16 },
  saveBtn: { borderRadius: 14 },
});
