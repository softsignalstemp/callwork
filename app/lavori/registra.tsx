import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useLavoriStore } from '@/store/useLavoriStore';
import { calcOre, calcGuadagno, formatEuro, formatOre, today } from '@/utils/formatters';
import { Colors } from '@/constants/colors';

export default function RegistraScreen() {
  const router = useRouter();
  const { datori, aggiungiSessione } = useLavoriStore();

  const [datoreId, setDatoreId] = useState('');
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
    if (!datoreId) { Alert.alert('Errore', 'Seleziona un datore'); return; }
    if (!isFinite(ore) || ore <= 0) { Alert.alert('Errore', "Orario fine deve essere dopo l'inizio"); return; }
    if (!isFinite(guadagno)) { Alert.alert('Errore', 'Paga oraria non valida'); return; }
    if (!data.match(/^\d{4}-\d{2}-\d{2}$/)) { Alert.alert('Errore', 'Data non valida (AAAA-MM-GG)'); return; }
    aggiungiSessione({ datoreId, data, oraInizio, oraFine, oreTotali: ore, guadagno, note: note.trim() || undefined, confermato });
    router.back();
  };

  const inputTheme = { colors: { onSurfaceVariant: Colors.textSecondary, primary: Colors.primary, outline: Colors.border, background: Colors.surface } };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Datore di lavoro *</Text>
        {datori.length === 0 ? (
          <Text style={{ color: Colors.textSecondary }}>Nessun datore. Aggiungine uno prima.</Text>
        ) : (
          <View style={styles.chipRow}>
            {datori.map((d) => (
              <Chip
                key={d.id}
                selected={datoreId === d.id}
                onPress={() => setDatoreId(d.id)}
                style={{
                  backgroundColor: datoreId === d.id ? d.colore + '33' : Colors.card,
                  borderColor: datoreId === d.id ? d.colore : Colors.border,
                  borderWidth: 1,
                }}
                selectedColor={d.colore}
                textStyle={{ color: datoreId === d.id ? d.colore : Colors.textSecondary }}
              >
                {d.nome}
              </Chip>
            ))}
          </View>
        )}

        {datore && (
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Paga: {formatEuro(datore.pagaOraria)}/h
          </Text>
        )}

        <TextInput
          label="Data *"
          value={data}
          onChangeText={setData}
          mode="outlined"
          placeholder="AAAA-MM-GG"
          keyboardType="numeric"
          theme={inputTheme}
          textColor={Colors.text}
        />

        <View style={styles.timeRow}>
          <TextInput
            label="Inizio"
            value={oraInizio}
            onChangeText={setOraInizio}
            mode="outlined"
            style={styles.timeInput}
            keyboardType="numeric"
            theme={inputTheme}
            textColor={Colors.text}
          />
          <Text style={styles.dash}>—</Text>
          <TextInput
            label="Fine"
            value={oraFine}
            onChangeText={setOraFine}
            mode="outlined"
            style={styles.timeInput}
            keyboardType="numeric"
            theme={inputTheme}
            textColor={Colors.text}
          />
        </View>

        {ore > 0 && datore && (
          <View style={[styles.summary, { borderColor: Colors.primary + '55' }]}>
            <Text style={[styles.summaryText, { color: Colors.primaryGlow }]}>
              {formatOre(ore)}  =  {formatEuro(guadagno)}
            </Text>
          </View>
        )}

        <TextInput
          label="Note (opzionale)"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          multiline
          numberOfLines={3}
          theme={inputTheme}
          textColor={Colors.text}
        />

        <SegmentedButtons
          value={confermato ? 'si' : 'no'}
          onValueChange={(v) => setConfermato(v === 'si')}
          buttons={[
            { value: 'no', label: 'In attesa' },
            { value: 'si', label: '✓ Confermato' },
          ]}
          theme={{ colors: { secondaryContainer: Colors.primaryMuted, onSecondaryContainer: Colors.primaryGlow } }}
        />

        <Button mode="contained" onPress={salva} buttonColor={Colors.primary} textColor="#fff">
          Salva turno
        </Button>
        <Button onPress={() => router.back()} textColor={Colors.textSecondary}>Annulla</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 20, gap: 16 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeInput: { flex: 1 },
  dash: { color: Colors.textMuted, fontSize: 20, marginTop: 8 },
  summary: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
});
