import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, SegmentedButtons, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useLavoriStore } from '@/store/useLavoriStore';
import { calcOre, calcGuadagno, formatEuro, formatOre, today } from '@/utils/formatters';

export default function RegistraScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { datori, aggiungiSessione } = useLavoriStore();

  const [datoreId, setDatoreId] = useState<string>('');
  const [data, setData] = useState(today());
  const [oraInizio, setOraInizio] = useState('08:00');
  const [oraFine, setOraFine] = useState('12:00');
  const [note, setNote] = useState('');
  const [confermato, setConfermato] = useState(false);

  const datore = datori.find((d) => d.id === datoreId);
  const pagaOraria = datore?.pagaOraria ?? 0;
  const ore = useMemo(() => calcOre(oraInizio, oraFine), [oraInizio, oraFine]);
  const guadagno = useMemo(() => calcGuadagno(ore, pagaOraria), [ore, pagaOraria]);

  const salva = () => {
    if (!datoreId) {
      Alert.alert('Errore', 'Seleziona un datore di lavoro');
      return;
    }
    if (ore <= 0) {
      Alert.alert('Errore', "L'orario di fine deve essere successivo all'inizio");
      return;
    }
    if (!data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Errore', 'Data non valida (usa il formato AAAA-MM-GG)');
      return;
    }

    aggiungiSessione({
      datoreId,
      data,
      oraInizio,
      oraFine,
      oreTotali: ore,
      guadagno,
      note: note.trim() || undefined,
      confermato,
    });
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Selezione datore */}
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
          Datore di lavoro *
        </Text>
        {datori.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Nessun datore disponibile. Aggiungine uno prima.
          </Text>
        ) : (
          <View style={styles.chipRow}>
            {datori.map((d) => (
              <Chip
                key={d.id}
                selected={datoreId === d.id}
                onPress={() => setDatoreId(d.id)}
                style={{ backgroundColor: datoreId === d.id ? d.colore + '33' : undefined }}
                selectedColor={d.colore}
              >
                {d.nome}
              </Chip>
            ))}
          </View>
        )}

        {datore && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Paga: {formatEuro(datore.pagaOraria)}/h
          </Text>
        )}

        {/* Data */}
        <TextInput
          label="Data *"
          value={data}
          onChangeText={setData}
          mode="outlined"
          placeholder="AAAA-MM-GG"
          keyboardType="numeric"
        />

        {/* Orari */}
        <View style={styles.row}>
          <TextInput
            label="Ora inizio"
            value={oraInizio}
            onChangeText={setOraInizio}
            mode="outlined"
            placeholder="08:00"
            style={styles.timeInput}
            keyboardType="numeric"
          />
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>—</Text>
          <TextInput
            label="Ora fine"
            value={oraFine}
            onChangeText={setOraFine}
            mode="outlined"
            placeholder="12:00"
            style={styles.timeInput}
            keyboardType="numeric"
          />
        </View>

        {/* Riepilogo calcolato */}
        {ore > 0 && datore && (
          <View style={[styles.summary, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
              Totale: {formatOre(ore)} = {formatEuro(guadagno)}
            </Text>
          </View>
        )}

        {/* Note */}
        <TextInput
          label="Note (opzionale)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          multiline
          numberOfLines={3}
        />

        {/* Confermato */}
        <SegmentedButtons
          value={confermato ? 'si' : 'no'}
          onValueChange={(v) => setConfermato(v === 'si')}
          buttons={[
            { value: 'no', label: 'In attesa' },
            { value: 'si', label: '✓ Confermato' },
          ]}
        />

        <Button mode="contained" onPress={salva} style={{ marginTop: 8 }}>
          Salva sessione
        </Button>
        <Button onPress={() => router.back()}>Annulla</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timeInput: { flex: 1 },
  summary: { borderRadius: 12, padding: 16, alignItems: 'center' },
});
