import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLavoriStore } from '@/store/useLavoriStore';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { StatCard } from '@/components/ui/StatCard';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatEuro, formatOre, monthLabel, prevMonth, nextMonth } from '@/utils/formatters';
import { BarChart } from '@/components/charts/BarChart';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { meseSelezionato, cambiaMese, datori, sessioni, caricaDati } = useLavoriStore();
  const stats = useMonthlyStats();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    caricaDati();
    setRefreshing(false);
  };

  const ultimeSessioni = sessioni.slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 32, paddingTop: insets.top }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header mese */}
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={() => cambiaMese(prevMonth(meseSelezionato))} />
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700', textTransform: 'capitalize' }}>
          {monthLabel(meseSelezionato)}
        </Text>
        <IconButton icon="chevron-right" onPress={() => cambiaMese(nextMonth(meseSelezionato))} />
      </View>

      {/* Guadagno principale */}
      <View style={styles.mainCard}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Guadagnato questo mese
        </Text>
        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>
          {formatEuro(stats.totaleGuadagnato)}
        </Text>
      </View>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <StatCard icon="🕐" value={formatOre(stats.oreTotali)} label="Ore lavorate" />
        <StatCard icon="📅" value={String(stats.giorniLavorati)} label="Giorni lavorati" />
      </View>

      {/* Bar chart ultimi 7 giorni */}
      {stats.last7Days.some((d) => d.guadagno > 0) && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, marginBottom: 12, fontWeight: '700' }}>
            Ultimi 7 giorni
          </Text>
          <BarChart data={stats.last7Days} color={Colors.primary} />
        </View>
      )}

      {/* Per datore */}
      {Object.keys(stats.perDatore).length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface, marginBottom: 8, fontWeight: '700' }}>
            Per datore
          </Text>
          {Object.entries(stats.perDatore).map(([id, d]) => (
            <View key={id} style={styles.datoreRow}>
              <View style={[styles.dot, { backgroundColor: d.colore }]} />
              <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSurface }}>{d.nome}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{formatOre(d.ore)}</Text>
              <Text variant="labelLarge" style={{ color: theme.colors.primary, minWidth: 72, textAlign: 'right' }}>
                {formatEuro(d.guadagno)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Sessioni recenti */}
      <View style={styles.sectionHeader}>
        <Text variant="titleSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Sessioni recenti
        </Text>
      </View>
      {ultimeSessioni.length === 0 ? (
        <EmptyState icon="📋" title="Nessuna sessione" subtitle="Vai su Lavori per registrare la prima" />
      ) : (
        <View style={{ paddingHorizontal: 16, gap: 4 }}>
          {ultimeSessioni.map((s) => (
            <SessioneCard
              key={s.id}
              sessione={s}
              nomeAdatore={datori.find((d) => d.id === s.datoreId)?.nome}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  mainCard: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  section: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 8 },
  datoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
