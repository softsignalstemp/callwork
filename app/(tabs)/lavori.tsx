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

type TabValue = 'datori' | 'turni';

export default function LavoriScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { datori, sessioni, rimuoviDatore, rimuoviSessione } = useLavoriStore();
  const stats = useMonthlyStats();
  const [activeTab, setActiveTab] = useState<TabValue>('datori');
  const [fabOpen, setFabOpen] = useState(false);

  const confirmDeleteDatore = (id: string, nome: string) => {
    Alert.alert(
      'Elimina datore',
      `Eliminare "${nome}" e tutti i suoi turni?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: () => rimuoviDatore(id) },
      ]
    );
  };

  const confirmDeleteTurno = (id: string) => {
    Alert.alert('Elimina turno', 'Eliminare questo turno?', [
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
            { value: 'turni', label: 'Turni' },
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 + insets.bottom }}>
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

        {activeTab === 'turni' && (
          <>
            {sessioni.length === 0 ? (
              <EmptyState icon="📋" title="Nessun turno" subtitle="Tocca + per registrare il tuo primo turno" />
            ) : (
              sessioni.map((s) => (
                <SessioneCard
                  key={s.id}
                  sessione={s}
                  nomeAdatore={datori.find((d) => d.id === s.datoreId)?.nome}
                  onDelete={() => confirmDeleteTurno(s.id)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        fabStyle={{ backgroundColor: Colors.primary }}
        actions={[
          {
            icon: 'briefcase-plus',
            label: 'Nuovo datore',
            onPress: () => { setFabOpen(false); router.push('/lavori/nuovo-datore'); },
            style: { backgroundColor: Colors.card },
            color: Colors.primary,
          },
          {
            icon: 'clock-plus',
            label: 'Registra turno',
            onPress: () => { setFabOpen(false); router.push('/lavori/registra'); },
            style: { backgroundColor: Colors.card },
            color: Colors.primaryGlow,
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        style={{ bottom: insets.bottom + 80 }}
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
