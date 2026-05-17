import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useLavoriStore } from '@/store/useLavoriStore';

const COLORI_PRESET = ['#6750A4', '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#009688', '#FF5722', '#795548'];

export default function NuovoDatoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { aggiungiDatore } = useLavoriStore();

  const [nome, setNome] = useState('');
  const [pagaOraria, setPagaOraria] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [colore, setColore] = useState(COLORI_PRESET[0]);

  const salva = () => {
    if (!nome.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }
    const paga = parseFloat(pagaOraria.replace(',', '.'));
    if (isNaN(paga) || paga <= 0) {
      Alert.alert('Errore', 'Inserisci una paga oraria valida');
      return;
    }
    aggiungiDatore({ nome: nome.trim(), pagaOraria: paga, descrizione: descrizione.trim() || undefined, colore });
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <TextInput
          label="Nome datore *"
          value={nome}
          onChangeText={setNome}
          mode="outlined"
          placeholder="es. Mario Rossi Srl"
        />

        <TextInput
          label="Paga oraria (€/h) *"
          value={pagaOraria}
          onChangeText={setPagaOraria}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="es. 11.50"
          left={<TextInput.Affix text="€" />}
        />

        <TextInput
          label="Descrizione (opzionale)"
          value={descrizione}
          onChangeText={setDescrizione}
          mode="outlined"
          multiline
          numberOfLines={3}
        />

        <Text variant="labelLarge" style={{ color: theme.colors.onSurface, marginTop: 8 }}>
          Colore identificativo
        </Text>
        <View style={styles.coloriGrid}>
          {COLORI_PRESET.map((c) => (
            <View
              key={c}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                colore === c && styles.colorDotSelected,
              ]}
              onTouchEnd={() => setColore(c)}
            />
          ))}
        </View>

        <Button mode="contained" onPress={salva} style={{ marginTop: 24 }}>
          Salva datore
        </Button>
        <Button onPress={() => router.back()} style={{ marginTop: 8 }}>
          Annulla
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  coloriGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
});
