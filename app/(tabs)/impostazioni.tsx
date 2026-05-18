import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Pressable, TouchableOpacity } from 'react-native';
import { Text, Switch, Button, Dialog, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDb } from '@/db/schema';
import { useLavoriStore } from '@/store/useLavoriStore';
import { exportCsv, availableMonths, meseLabel } from '@/utils/exportCsv';
import { Colors } from '@/constants/colors';

// ─── SettingRow ───────────────────────────────────────────────────────────────

interface SettingRowProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, label, description, onPress, right, danger }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : danger ? 0.85 : 1 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: (danger ? Colors.error : Colors.primary) + '22' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: danger ? Colors.error : Colors.text }]}>{label}</Text>
        {description && <Text style={styles.rowDesc}>{description}</Text>}
      </View>
      {right ?? (onPress && <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />)}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ImpostazioniScreen() {
  const insets = useSafeAreaInsets();
  const { darkMode, toggleDarkMode } = useSettingsStore();
  const caricaDati = useLavoriStore((s) => s.caricaDati);

  const [integrityResult, setIntegrityResult] = useState<string | null>(null);
  const [showIntegrity, setShowIntegrity] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMonths] = useState(() => availableMonths());

  // ── Verifica integrità ──────────────────────────────────────────────────────

  const verificaIntegrita = () => {
    const db = getDb();
    const issues: string[] = [];
    const sessioni = db.getAllSync(
      `SELECT s.id, s.ora_inizio, s.ora_fine, d.id as did
       FROM sessioni s LEFT JOIN datori d ON s.datore_id = d.id`
    ) as Record<string, unknown>[];
    for (const s of sessioni) {
      const [ih, im] = (s.ora_inizio as string).split(':').map(Number);
      const [fh, fm] = (s.ora_fine as string).split(':').map(Number);
      if ((fh * 60 + fm) - (ih * 60 + im) <= 0)
        issues.push(`Sessione ${s.id}: orario fine ≤ inizio`);
      if (s.did === null)
        issues.push(`Sessione ${s.id}: datore mancante`);
    }
    setIntegrityResult(
      issues.length === 0
        ? '✅ Tutti i dati sono integri, nessuna anomalia trovata.'
        : `⚠️ ${issues.length} problemi trovati:\n\n${issues.join('\n')}`
    );
    setShowIntegrity(true);
  };

  // ── Elimina tutto ───────────────────────────────────────────────────────────

  const eliminaTutti = () => {
    Alert.alert('Elimina tutto', 'Questa operazione è irreversibile.', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Elimina',
        style: 'destructive',
        onPress: () => {
          const db = getDb();
          db.execSync('DELETE FROM sessioni');
          db.execSync('DELETE FROM lavori');
          db.execSync('DELETE FROM datori');
          db.execSync('DELETE FROM disponibilita');
          caricaDati();
        },
      },
    ]);
  };

  // ── Esporta CSV ─────────────────────────────────────────────────────────────

  const handleExport = async (scope: Parameters<typeof exportCsv>[0]) => {
    setExporting(true);
    setShowExport(false);
    try {
      await exportCsv(scope);
    } catch (e) {
      Alert.alert('Errore esportazione', e instanceof Error ? e.message : 'Errore sconosciuto');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryMuted + '88', Colors.bg]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.title}>Impostazioni</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* ── Aspetto ── */}
        <SectionHeader title="Aspetto" />
        <View style={styles.card}>
          <SettingRow
            icon="weather-night"
            label="Tema scuro"
            description={darkMode ? 'Attivo' : 'Disattivo'}
            right={<Switch value={darkMode} onValueChange={toggleDarkMode} color={Colors.primary} />}
          />
        </View>

        {/* ── Dati ── */}
        <SectionHeader title="Dati" />
        <View style={styles.card}>
          <SettingRow
            icon="file-delimited-outline"
            label="Esporta CSV"
            description="Condividi i turni in formato foglio calcolo"
            onPress={() => setShowExport(true)}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="shield-check-outline"
            label="Verifica integrità"
            description="Controlla inconsistenze nei dati locali"
            onPress={verificaIntegrita}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="delete-forever-outline"
            label="Elimina tutti i dati"
            description="Operazione irreversibile"
            onPress={eliminaTutti}
            danger
          />
        </View>

        {/* ── Info ── */}
        <SectionHeader title="Informazioni" />
        <View style={styles.card}>
          <SettingRow
            icon="file-document-outline"
            label="Informativa privacy"
            onPress={() =>
              Alert.alert(
                'Privacy',
                'Tutti i dati sono salvati localmente sul tuo dispositivo. Nessun dato viene trasmesso a server esterni.'
              )
            }
          />
          <View style={styles.separator} />
          <SettingRow
            icon="information-outline"
            label="Versione app"
            description={`v${Constants.expoConfig?.version ?? '1.0.0'}`}
          />
        </View>
      </View>

      {/* ── Dialog: verifica integrità ── */}
      <Portal>
        <Dialog
          visible={showIntegrity}
          onDismiss={() => setShowIntegrity(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={{ color: Colors.text }}>Verifica integrità</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: Colors.textSecondary }}>{integrityResult}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowIntegrity(false)} textColor={Colors.primary}>Chiudi</Button>
          </Dialog.Actions>
        </Dialog>

        {/* ── Dialog: esporta CSV ── */}
        <Dialog
          visible={showExport}
          onDismiss={() => setShowExport(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={{ color: Colors.text }}>Esporta CSV</Dialog.Title>
          <Dialog.Content style={{ gap: 8 }}>
            <Text style={styles.exportHint}>
              Scegli il periodo da esportare. Il file verrà condiviso come .csv apribile con Excel, Numbers o Google Sheets.
            </Text>

            {/* Tutti i dati */}
            <TouchableOpacity
              onPress={() => handleExport({ type: 'tutto' })}
              activeOpacity={0.75}
              style={styles.exportOption}
            >
              <MaterialCommunityIcons name="database-export-outline" size={20} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.exportOptionLabel}>Tutti i turni</Text>
                <Text style={styles.exportOptionDesc}>Esporta l'intera cronologia</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Per mese */}
            {exportMonths.length > 0 && (
              <>
                <Text style={styles.exportMonthsTitle}>Per mese</Text>
                {exportMonths.map((mese) => (
                  <TouchableOpacity
                    key={mese}
                    onPress={() => handleExport({ type: 'mese', mese })}
                    activeOpacity={0.75}
                    style={styles.exportOption}
                  >
                    <MaterialCommunityIcons name="calendar-export-outline" size={20} color={Colors.primaryGlow} />
                    <Text style={[styles.exportOptionLabel, { flex: 1 }]}>
                      {meseLabel(mese)}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {exportMonths.length === 0 && (
              <Text style={{ color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 8 }}>
                Nessun turno registrato da esportare.
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExport(false)} textColor={Colors.textSecondary}>Annulla</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  content: { padding: 16, gap: 8 },

  sectionHeader: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDesc: { color: Colors.textMuted, fontSize: 12 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 68 },

  dialog: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1 },

  exportHint: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  exportMonthsTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  exportOptionLabel: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  exportOptionDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});
