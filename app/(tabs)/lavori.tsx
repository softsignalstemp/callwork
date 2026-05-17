import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, FAB, SegmentedButtons } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useLavoriStore } from '@/store/useLavoriStore';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { DatoreCard } from '@/components/jobs/DatoreCard';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/colors';

type TabValue = 'datori' | 'sessioni';

export default function LavoriScreen() {
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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primaryMuted + '88', Colors.bg]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.title}>Lavori</Text>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          buttons={[
            { value: 'datori', label: 'Datori' },
            { value: 'sessioni', label: 'Sessioni' },
          ]}
          style={styles.tabs}
          theme={{
            colors: {
              secondaryContainer: Colors.primaryMuted,
              onSecondaryContainer: Colors.primaryGlow,
            },
          }}
        />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {activeTab === 'datori' && (
          <>
            {datori.length === 0 ? (
              <EmptyState icon="🏢" title="Nessun datore" subtitle="Tocca + per aggiungere il primo datore" />
            ) : (
              datori.map((d) => (
                <DatoreCard
                  key={d.id}
                  datore={d}
                  guadagnoMese={stats.perDatore[d.id]?.guadagno ?? 0}
                  numSessioni={sessioni.filter((s) => s.datoreId === d.id).length}
                  onDelete={() => confirmDeleteDatore(d.id, d.nome)}
                />
              ))
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
        fabStyle={{ backgroundColor: Colors.primary }}
        actions={[
          {
            icon: 'briefcase-plus',
            label: 'Nuovo datore',
            onPress: () => router.push('/lavori/nuovo-datore'),
            style: { backgroundColor: Colors.card },
            color: Colors.primary,
          },
          {
            icon: 'clock-plus',
            label: 'Registra lavoro',
            onPress: () => router.push('/lavori/registra'),
            style: { backgroundColor: Colors.card },
            color: Colors.primaryGlow,
          },
        ]}
        onStateChange={() => {}}
        style={{ bottom: insets.bottom + 64 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  tabs: { borderColor: Colors.border },
});
