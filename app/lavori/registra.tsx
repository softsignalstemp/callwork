import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLavoriStore } from '@/store/useLavoriStore';
import { TimePickerField, DatePickerField } from '@/components/ui/PickerField';
import { calcOre, calcGuadagno, formatEuro, formatOre, today } from '@/utils/formatters';
import { Colors } from '@/constants/colors';

export default function RegistraScreen() {
  const router = useRouter();
  const { datori, aggiungiSessione } = useLavoriStore();

  const [datoreId, setDatoreId] = useState('');
  const [data, setData] = useState(today());
  const [oraInizio, setOraInizio] = useState('08:00');
  const [oraFine, setOraFine] = useState('17:00');
  const [note, setNote] = useState('');
  const [confermato, setConfermato] = useState(false);

  const [pagaOverrideStr, setPagaOverrideStr] = useState('');
  const [pagaExpanded, setPagaExpanded] = useState(false);

  const datore = datori.find((d) => d.id === datoreId);

  const pagaOraria = useMemo(() => {
    if (pagaOverrideStr.trim()) {
      const parsed = parseFloat(pagaOverrideStr.replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return datore?.pagaOraria ?? 0;
  }, [pagaOverrideStr, datore]);

  const pagaOverrideValida = pagaOverrideStr.trim()
    ? !isNaN(parseFloat(pagaOverrideStr.replace(',', '.'))) && parseFloat(pagaOverrideStr.replace(',', '.')) > 0
    : true;

  const isOverride = pagaOverrideStr.trim() !== '' && pagaOverrideValida;

  const ore = useMemo(() => calcOre(oraInizio, oraFine), [oraInizio, oraFine]);
  const guadagno = useMemo(() => calcGuadagno(ore, pagaOraria), [ore, pagaOraria]);

  const handleDatoreChange = (id: string) => {
    setDatoreId(id);
    setPagaOverrideStr('');
    setPagaExpanded(false);
  };

  const salva = () => {
    if (!datoreId) { Alert.alert('Nessun datore selezionato', 'Seleziona un datore di lavoro prima di salvare.'); return; }
    if (!isFinite(ore) || ore <= 0) { Alert.alert('Orario non valido', "L'ora di fine deve essere successiva all'inizio."); return; }
    if (!pagaOverrideValida) { Alert.alert('Paga non valida', 'Inserisci una paga oraria valida o lascia il campo vuoto per usare la paga base.'); return; }
    aggiungiSessione({ datoreId, data, oraInizio, oraFine, oreTotali: ore, guadagno, note: note.trim() || undefined, confermato });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

      {/* ── DATORE ─────────────────────────────────────── */}
      <SectionLabel text="Datore di lavoro" required />
      {datori.length === 0 ? (
        <View style={styles.emptyDatori}>
          <MaterialCommunityIcons name="briefcase-off-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyDatoriText}>Nessun datore registrato</Text>
          <Button
            mode="contained-tonal"
            onPress={() => router.replace('/lavori/nuovo-datore')}
            buttonColor={Colors.primaryMuted}
            textColor={Colors.primaryGlow}
            style={{ marginTop: 8 }}
          >
            Aggiungi datore
          </Button>
        </View>
      ) : (
        <View style={styles.datoriGrid}>
          {datori.map((d) => {
            const selected = datoreId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => handleDatoreChange(d.id)}
                activeOpacity={0.75}
                style={[
                  styles.datoreChip,
                  { borderColor: selected ? d.colore : Colors.border },
                  selected && { backgroundColor: d.colore + '22' },
                ]}
              >
                <View style={[styles.datoreColorDot, { backgroundColor: d.colore }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.datoreNome, { color: selected ? d.colore : Colors.text }]}>{d.nome}</Text>
                  <Text style={styles.datoreRate}>{formatEuro(d.pagaOraria)}/h (base)</Text>
                </View>
                {selected && <MaterialCommunityIcons name="check-circle" size={18} color={d.colore} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── PAGA ORARIA (collassabile) ─────────────────── */}
      {datore && (
        <>
          <TouchableOpacity
            onPress={() => setPagaExpanded((v) => !v)}
            activeOpacity={0.75}
            style={styles.pagaRow}
          >
            <MaterialCommunityIcons name="cash-clock" size={18} color={isOverride ? Colors.available : Colors.textMuted} />
            <Text style={styles.pagaBaseLabel}>
              Paga base: <Text style={styles.pagaBaseValue}>{formatEuro(datore.pagaOraria)}/h</Text>
            </Text>
            {isOverride && (
              <View style={styles.pagaOverrideBadge}>
                <Text style={styles.pagaOverrideBadgeText}>{formatEuro(pagaOraria)}/h questo turno</Text>
              </View>
            )}
            <MaterialCommunityIcons
              name={pagaExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {pagaExpanded && (
            <View style={styles.pagaOverrideBox}>
              <Text style={styles.pagaOverrideHint}>
                Lascia vuoto per usare la paga base. Cambia solo se questo turno è pagato diversamente.
              </Text>
              <TextInput
                label="Paga per questo turno (€/h)"
                value={pagaOverrideStr}
                onChangeText={setPagaOverrideStr}
                mode="outlined"
                keyboardType="decimal-pad"
                placeholder={String(datore.pagaOraria)}
                left={<TextInput.Affix text="€" textStyle={{ color: Colors.textSecondary }} />}
                error={!pagaOverrideValida}
                textColor={Colors.text}
                style={{ backgroundColor: Colors.card }}
                theme={{
                  colors: {
                    primary: Colors.available,
                    outline: Colors.border,
                    onSurfaceVariant: Colors.textSecondary,
                    error: Colors.error,
                  },
                }}
              />
              {pagaOverrideStr.trim() !== '' && (
                <TouchableOpacity onPress={() => setPagaOverrideStr('')} style={styles.pagaResetBtn}>
                  <MaterialCommunityIcons name="close-circle-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.pagaResetText}>Ripristina paga base</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {/* ── DATA ───────────────────────────────────────── */}
      <SectionLabel text="Data" />
      <DatePickerField value={data} onChange={setData} />

      {/* ── ORARIO ─────────────────────────────────────── */}
      <SectionLabel text="Orario di lavoro" />
      <TimePickerField label="Ora inizio" value={oraInizio} onChange={setOraInizio} accent={Colors.primary} />
      <TimePickerField label="Ora fine" value={oraFine} onChange={setOraFine} accent={Colors.primaryGlow} />

      {/* ── RIEPILOGO LIVE ─────────────────────────────── */}
      {ore > 0 && datore ? (
        <View style={styles.summary}>
          <LinearGradient
            colors={['transparent', Colors.primary + '18', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryOre}>{formatOre(ore)}</Text>
            <Text style={styles.summaryEq}>=</Text>
            <Text style={styles.summaryGuadagno}>{formatEuro(guadagno)}</Text>
          </View>
          <Text style={styles.summaryDetail}>
            {formatEuro(pagaOraria)}/h × {ore.toFixed(2)}h
            {isOverride && <Text style={{ color: Colors.available }}> (paga modificata)</Text>}
          </Text>
        </View>
      ) : ore <= 0 && oraFine <= oraInizio ? (
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={Colors.error} />
          <Text style={styles.warningText}>L'ora di fine è precedente all'inizio</Text>
        </View>
      ) : null}

      {/* ── STATO ──────────────────────────────────────── */}
      <SectionLabel text="Stato pagamento" />
      <View style={styles.statusRow}>
        {[
          { value: false, label: 'In attesa', icon: 'clock-outline', color: Colors.available },
          { value: true, label: 'Confermato', icon: 'check-circle-outline', color: Colors.confirmed },
        ].map(({ value, label, icon, color }) => (
          <TouchableOpacity
            key={label}
            onPress={() => setConfermato(value)}
            activeOpacity={0.75}
            style={[
              styles.statusChip,
              { borderColor: confermato === value ? color : Colors.border },
              confermato === value && { backgroundColor: color + '22' },
            ]}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={18}
              color={confermato === value ? color : Colors.textMuted}
            />
            <Text style={[styles.statusLabel, { color: confermato === value ? color : Colors.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── NOTE ───────────────────────────────────────── */}
      <SectionLabel text="Note (opzionale)" />
      <TextInput
        value={note}
        onChangeText={setNote}
        mode="outlined"
        multiline
        numberOfLines={3}
        placeholder="Aggiungi una nota..."
        placeholderTextColor={Colors.textMuted}
        textColor={Colors.text}
        style={styles.noteInput}
        theme={{
          colors: {
            primary: Colors.primary,
            outline: Colors.border,
            onSurfaceVariant: Colors.textSecondary,
            background: Colors.card,
          },
        }}
      />

      {/* ── AZIONI ─────────────────────────────────────── */}
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
          Salva turno
        </Button>
        <Button onPress={() => router.back()} textColor={Colors.textSecondary}>
          Annulla
        </Button>
      </View>
    </ScrollView>
  );
}

function SectionLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{text}</Text>
      {required && <Text style={styles.sectionRequired}>*</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 20, gap: 10, paddingBottom: 40 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, marginBottom: 6 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  sectionRequired: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  emptyDatori: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    gap: 8,
  },
  emptyDatoriText: { color: Colors.textSecondary, fontSize: 14 },
  datoriGrid: { gap: 8 },
  datoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  datoreColorDot: { width: 10, height: 10, borderRadius: 5 },
  datoreNome: { fontSize: 15, fontWeight: '600' },
  datoreRate: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

  // Paga override
  pagaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  pagaBaseLabel: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  pagaBaseValue: { color: Colors.text, fontWeight: '600' },
  pagaOverrideBadge: {
    backgroundColor: Colors.available + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.available + '55',
  },
  pagaOverrideBadgeText: { color: Colors.available, fontSize: 11, fontWeight: '700' },
  pagaOverrideBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.available + '44',
    padding: 14,
    gap: 10,
  },
  pagaOverrideHint: { color: Colors.textMuted, fontSize: 12, lineHeight: 17 },
  pagaResetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  pagaResetText: { color: Colors.textMuted, fontSize: 12 },

  summary: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  summaryOre: { color: Colors.textSecondary, fontSize: 20, fontWeight: '700' },
  summaryEq: { color: Colors.textMuted, fontSize: 16 },
  summaryGuadagno: { color: Colors.primaryGlow, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  summaryDetail: { color: Colors.textMuted, fontSize: 12 },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.error + '18',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.error + '44',
    marginTop: 4,
  },
  warningText: { color: Colors.error, fontSize: 13, flex: 1 },

  statusRow: { flexDirection: 'row', gap: 10 },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statusLabel: { fontSize: 14, fontWeight: '600' },

  noteInput: { backgroundColor: Colors.card },

  actions: { gap: 8, marginTop: 8 },
  saveBtn: { borderRadius: 14 },
});
