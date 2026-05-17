import React, { useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLavoriStore } from '@/store/useLavoriStore';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { RingChart } from '@/components/charts/RingChart';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { formatEuro, formatOre, monthLabel, prevMonth, nextMonth } from '@/utils/formatters';
import { Colors } from '@/constants/colors';

function useFadeSlide(delayMs = 0) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delayMs, withSpring(0, { damping: 18 }));
  }, []);

  return useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { meseSelezionato, cambiaMese, datori, sessioni, caricaDati } = useLavoriStore();
  const stats = useMonthlyStats();
  const [refreshing, setRefreshing] = React.useState(false);

  const heroStyle = useFadeSlide(0);
  const statsStyle = useFadeSlide(120);
  const chartStyle = useFadeSlide(220);
  const ringStyle = useFadeSlide(320);
  const listStyle = useFadeSlide(400);

  const onRefresh = () => {
    setRefreshing(true);
    caricaDati();
    setRefreshing(false);
  };

  const ringSegments = Object.entries(stats.perDatore).map(([, d]) => ({
    label: d.nome,
    value: d.guadagno,
    color: d.colore,
  }));

  const ultimeSessioni = sessioni.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* ── HERO HEADER ── */}
      <LinearGradient
        colors={[Colors.primaryMuted + 'CC', Colors.bg]}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Month nav */}
        <View style={styles.monthRow}>
          <IconButton
            icon="chevron-left"
            iconColor={Colors.textSecondary}
            onPress={() => cambiaMese(prevMonth(meseSelezionato))}
          />
          <Text style={styles.monthLabel}>{monthLabel(meseSelezionato)}</Text>
          <IconButton
            icon="chevron-right"
            iconColor={Colors.textSecondary}
            onPress={() => cambiaMese(nextMonth(meseSelezionato))}
          />
        </View>

        {/* Main earnings */}
        <Animated.View style={[styles.heroEarnings, heroStyle]}>
          <Text style={styles.heroLabel}>Guadagnato questo mese</Text>
          <AnimatedCounter
            value={stats.totaleGuadagnato}
            format={formatEuro}
            style={styles.heroAmount}
          />
          <View style={styles.heroDivider} />
        </Animated.View>
      </LinearGradient>

      {/* ── STAT CARDS ── */}
      <Animated.View style={[styles.statsRow, statsStyle]}>
        <StatCard
          icon="⏱"
          value={formatOre(stats.oreTotali)}
          label="Ore lavorate"
          accent={Colors.primary}
        />
        <StatCard
          icon="📅"
          value={String(stats.giorniLavorati)}
          label="Giorni lavorati"
          accent={Colors.confirmed}
        />
      </Animated.View>

      {/* ── BAR CHART ── */}
      <Animated.View style={chartStyle}>
        <GlassCard style={styles.section} glow>
          <Text style={styles.sectionTitle}>Ultimi 7 giorni</Text>
          <AnimatedBarChart data={stats.last7Days} />
        </GlassCard>
      </Animated.View>

      {/* ── RING CHART ── */}
      {ringSegments.length > 0 && (
        <Animated.View style={ringStyle}>
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Per datore</Text>
            <RingChart
              segments={ringSegments}
              centerLabel="totale"
              centerValue={formatEuro(stats.totaleGuadagnato)}
            />
          </GlassCard>
        </Animated.View>
      )}

      {/* ── SESSIONI RECENTI ── */}
      <Animated.View style={listStyle}>
        <Text style={styles.sectionTitle2}>Sessioni recenti</Text>
        {ultimeSessioni.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nessuna sessione"
            subtitle="Vai su Lavori per registrare la prima sessione"
          />
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
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  hero: { paddingHorizontal: 8, paddingBottom: 24 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  monthLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
    minWidth: 180,
    textAlign: 'center',
  },

  heroEarnings: { alignItems: 'center', gap: 6, paddingHorizontal: 24 },
  heroLabel: { color: Colors.textSecondary, fontSize: 13, letterSpacing: 0.5 },
  heroAmount: {
    color: Colors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    textShadowColor: Colors.primary,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  } as any,
  heroDivider: {
    width: 60,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    marginTop: 4,
    opacity: 0.7,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },

  section: { margin: 16, padding: 20, marginBottom: 0 },
  sectionTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  sectionTitle2: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
});
