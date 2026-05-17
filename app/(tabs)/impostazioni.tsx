import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, useTheme, List, Switch, Divider, Button, Dialog, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getDb } from '@/db/schema';
import { useLavoriStore } from '@/store/useLavoriStore';

export default function ImpostazioniScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { darkMode, toggleDarkMode } = useSettingsStore();
  const caricaDati = useLavoriStore((s) => s.caricaDati);
  const [integrityResult, setIntegrityResult] = useState<string | null>(null);
  const [showIntegrity, setShowIntegrity] = useState(false);

  const verificaIntegrita = () => {
    const db = getDb();
    const issues: string[] = [];

    const sessioni = db.getAllSync(`
      SELECT s.*, d.id as did FROM sessioni s
      LEFT JOIN datori d ON s.datore_id = d.id
    `) as Record<string, unknown>[];

    for (const s of sessioni) {
      const [ih, im] = (s.ora_inizio as string).split(':').map(Number);
      const [fh, fm] = (s.ora_fine as string).split(':').map(Number);
      const minuti = (fh * 60 + fm) - (ih * 60 + im);
      if (minuti <= 0) issues.push(`Sessione ${s.id}: orario fine ≤ inizio`);
      if (s.did === null) issues.push(`Sessione ${s.id}: datore non trovato`);
    }

    setIntegrityResult(
      issues.length === 0
        ? '✅ Nessun problema trovato. Tutti i dati sono integri.'
        : `⚠️ Trovati ${issues.length} problemi:\n\n${issues.join('\n')}`
    );
    setShowIntegrity(true);
  };

  const eliminaTuttiDati = () => {
    Alert.alert(
      'Elimina tutti i dati',
      'Questa operazione è irreversibile. Tutti i datori, sessioni e disponibilità verranno eliminati.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina tutto',
          style: 'destructive',
          onPress: () => {
            const db = getDb();
            db.execSync('DELETE FROM sessioni; DELETE FROM lavori; DELETE FROM datori; DELETE FROM disponibilita;');
            caricaDati();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Impostazioni
      </Text>

      {/* Aspetto */}
      <List.Section>
        <List.Subheader style={{ color: theme.colors.primary }}>Aspetto</List.Subheader>
        <List.Item
          title="Tema scuro"
          titleStyle={{ color: theme.colors.onSurface }}
          description={darkMode ? 'Attivo' : 'Non attivo'}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => <List.Icon {...props} icon="weather-night" color={theme.colors.primary} />}
          right={() => <Switch value={darkMode} onValueChange={toggleDarkMode} />}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </List.Section>

      <Divider />

      {/* Dati */}
      <List.Section>
        <List.Subheader style={{ color: theme.colors.primary }}>Dati</List.Subheader>
        <List.Item
          title="Verifica integrità"
          titleStyle={{ color: theme.colors.onSurface }}
          description="Controlla inconsistenze nei dati locali"
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => <List.Icon {...props} icon="shield-check" color={theme.colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={verificaIntegrita}
          style={{ backgroundColor: theme.colors.surface }}
        />
        <List.Item
          title="Elimina tutti i dati"
          titleStyle={{ color: theme.colors.error }}
          description="Rimuove permanentemente tutti i record"
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => <List.Icon {...props} icon="delete-forever" color={theme.colors.error} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={eliminaTuttiDati}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </List.Section>

      <Divider />

      {/* Info */}
      <List.Section>
        <List.Subheader style={{ color: theme.colors.primary }}>Informazioni</List.Subheader>
        <List.Item
          title="Informativa sulla privacy"
          titleStyle={{ color: theme.colors.onSurface }}
          left={(props) => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Privacy', 'Tutti i dati sono salvati localmente sul tuo dispositivo. Nessun dato viene trasmesso a server esterni.')}
          style={{ backgroundColor: theme.colors.surface }}
        />
        <List.Item
          title="Versione app"
          titleStyle={{ color: theme.colors.onSurface }}
          description={`v${Constants.expoConfig?.version ?? '1.0.0'}`}
          descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
          left={(props) => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
          style={{ backgroundColor: theme.colors.surface }}
        />
      </List.Section>

      {/* Dialog integrità */}
      <Portal>
        <Dialog visible={showIntegrity} onDismiss={() => setShowIntegrity(false)}>
          <Dialog.Title>Verifica integrità</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{integrityResult}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowIntegrity(false)}>Chiudi</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontWeight: '800', marginHorizontal: 16, marginBottom: 8 },
});
