import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, useTheme, FAB, SegmentedButtons, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLavoriStore } from '@/store/useLavoriStore';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { DatoreCard } from '@/components/jobs/DatoreCard';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { EmptyState } from '@/components/ui/EmptyState';

type TabValue = 'datori' | 'sessioni';

export default function LavoriScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datori, sessioni, rimuoviDatore, rimuoviSessione } = useLavoriStore();
  const stats = useMonthlyStats();
  const [activeTab, setActiveTab] = useState<TabValue>('datori');

  const confirmDeleteDatore = (id: string, nome: string) => {
    Alert.alert(
      'Elimina datore',
      `Eliminare "${nome}" e tutte le sue sessioni?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: () => rimuoviDatore(id) },
      ]
    );
  };

  const confirmDeleteSessione = (id: string) => {
    Alert.alert('Elimina sessione', 'Eliminare questa sessione?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => rimuoviSessione(id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '800', marginBottom: 12 }}>
          Lavori
        </Text>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          buttons={[
            { value: 'datori', label: 'Datori' },
            { value: 'sessioni', label: 'Sessioni' },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {activeTab === 'datori' && (
          <>
            {datori.length === 0 ? (
              <EmptyState icon="🏢" title="Nessun datore" subtitle="Tocca + per aggiungere il primo datore di lavoro" />
            ) : (
              datori.map((d) => {
                const perDatoreStats = stats.perDatore[d.id];
                return (
                  <DatoreCard
                    key={d.id}
                    datore={d}
                    guadagnoMese={perDatoreStats?.guadagno ?? 0}
                    numSessioni={sessioni.filter((s) => s.datoreId === d.id).length}
                    onDelete={() => confirmDeleteDatore(d.id, d.nome)}
                  />
                );
              })
            )}
          </>
        )}

        {activeTab === 'sessioni' && (
          <>
            {sessioni.length === 0 ? (
              <EmptyState icon="📋" title="Nessuna sessione" subtitle="Tocca + per registrare il tuo primo lavoro" />
            ) : (
              sessioni.map((s) => (
                <SessioneCard
                  key={s.id}
                  sessione={s}
                  nomeAdatore={datori.find((d) => d.id === s.datoreId)?.nome}
                  onDelete={() => confirmDeleteSessione(s.id)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <FAB.Group
        open={false}
        visible
        icon="plus"
        actions={[
          {
            icon: 'briefcase-plus',
            label: 'Nuovo datore',
            onPress: () => router.push('/lavori/nuovo-datore'),
          },
          {
            icon: 'clock-plus',
            label: 'Registra lavoro',
            onPress: () => router.push('/lavori/registra'),
          },
        ]}
        onStateChange={() => {}}
        style={{ bottom: insets.bottom + 64 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
