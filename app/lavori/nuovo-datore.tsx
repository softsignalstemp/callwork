import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useLavoriStore } from '@/store/useLavoriStore';
import { Colors } from '@/constants/colors';

const COLORI_PRESET = [
  '#8B5CF6', '#6D28D9', '#EC4899', '#F43F5E',
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
];

export default function NuovoDatoreScreen() {
  const router = useRouter();
  const { aggiungiDatore } = useLavoriStore();

  const [nome, setNome] = useState('');
  const [pagaOraria, setPagaOraria] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [colore, setColore] = useState(COLORI_PRESET[0]);

  const salva = () => {
    if (!nome.trim()) { Alert.alert('Errore', 'Il nome è obbligatorio'); return; }
    const paga = parseFloat(pagaOraria.replace(',', '.'));
    if (isNaN(paga) || paga <= 0) { Alert.alert('Errore', 'Paga oraria non valida'); return; }
    aggiungiDatore({ nome: nome.trim(), pagaOraria: paga, descrizione: descrizione.trim() || undefined, colore });
    router.back();
  };

  const inputTheme = {
    colors: {
      onSurfaceVariant: Colors.textSecondary,
      primary: Colors.primary,
      outline: Colors.border,
      background: Colors.surface,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          label="Nome datore *"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          placeholder="es. Mario Rossi Srl"
          theme={inputTheme}
          textColor={Colors.text}
        />

        <TextInput
          label="Paga oraria (€/h) *"
          value={pagaOraria}
          onChangeText={setPagaOraria}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="es. 11.50"
          left={<TextInput.Affix text="€" textStyle={{ color: Colors.textSecondary }} />}
          theme={inputTheme}
          textColor={Colors.text}
        />

        <TextInput
          label="Descrizione (opzionale)"
          value={descrizione}
          onChangeText={setDescrizione}
          mode="outlined"
          multiline
          numberOfLines={3}
          theme={inputTheme}
          textColor={Colors.text}
        />

        <Text style={styles.colorLabel}>Colore identificativo</Text>
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
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Preview */}
        <View style={[styles.preview, { borderColor: colore + '55' }]}>
          <View style={[styles.previewBar, { backgroundColor: colore }]} />
          <Text style={styles.previewNome}>{nome || 'Nome datore'}</Text>
          <Text style={[styles.previewPaga, { color: colore }]}>
            €{pagaOraria || '0'}/h
          </Text>
        </View>

        <Button mode="contained" onPress={salva} buttonColor={Colors.primary} textColor="#fff">
          Salva datore
        </Button>
        <Button onPress={() => router.back()} textColor={Colors.textSecondary}>Annulla</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 20, gap: 16 },
  colorLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 40, height: 40, borderRadius: 20 },
  preview: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 14,
  },
  previewBar: { width: 4, alignSelf: 'stretch' },
  previewNome: { color: Colors.text, fontWeight: '700', fontSize: 15, flex: 1, paddingVertical: 16 },
  previewPaga: { fontWeight: '700', fontSize: 13, paddingRight: 16 },
});
