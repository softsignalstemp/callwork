import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const ty = useSharedValue(20);
  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 450 }));
    ty.value = withDelay(delayMs, withSpring(0, { damping: 20 }));
  }, []);
  return useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: ty.value }] }));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meseSelezionato, cambiaMese, datori, sessioni, caricaDati } = useLavoriStore();
  const stats = useMonthlyStats();
  const [refreshing, setRefreshing] = React.useState(false);

  const s0 = useFadeSlide(0);
  const s1 = useFadeSlide(100);
  const s2 = useFadeSlide(180);
  const s3 = useFadeSlide(260);
  const s4 = useFadeSlide(340);

  const onRefresh = () => {
    setRefreshing(true);
    caricaDati();
    setRefreshing(false);
  };

  const ringSegments = Object.entries(stats.perDatore)
    .map(([, d]) => ({ label: d.nome, value: d.guadagno, color: d.colore }))
    .filter((s) => s.value > 0);

  const ultimeSessioni = sessioni.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* ── HERO ── */}
      <LinearGradient
        colors={[Colors.primaryMuted + 'CC', Colors.bg]}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.monthRow}>
          <IconButton icon="chevron-left" iconColor={Colors.textSecondary} size={22}
            onPress={() => cambiaMese(prevMonth(meseSelezionato))} />
          <Text style={styles.monthLabel}>{monthLabel(meseSelezionato)}</Text>
          <IconButton icon="chevron-right" iconColor={Colors.textSecondary} size={22}
            onPress={() => cambiaMese(nextMonth(meseSelezionato))} />
        </View>

        <Animated.View style={[styles.heroEarnings, s0]}>
          <Text style={styles.heroLabel}>Guadagnato questo mese</Text>
          <AnimatedCounter
            value={stats.totaleGuadagnato}
            format={formatEuro}
            style={styles.heroAmount}
          />
          <View style={styles.heroDivider} />
        </Animated.View>
      </LinearGradient>

      {/* ── QUICK REGISTER BUTTON ── */}
      <Animated.View style={[{ paddingHorizontal: 16, marginTop: 20 }, s1]}>
        <TouchableOpacity
          onPress={() => router.push('/lavori/registra')}
          activeOpacity={0.8}
          style={styles.quickRegWrapper}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quickRegGradient}
          >
            <View style={styles.quickRegIcon}>
              <MaterialCommunityIcons name="plus" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.quickRegText}>Registra lavoro</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* ── STAT CARDS ── */}
      <Animated.View style={[styles.statsRow, s1]}>
        <StatCard icon="⏱" value={formatOre(stats.oreTotali)} label="Ore lavorate" accent={Colors.primary} />
        <StatCard icon="📅" value={String(stats.giorniLavorati)} label="Giorni lavorati" accent={Colors.confirmed} />
      </Animated.View>

      {/* ── BAR CHART ── */}
      {stats.last7Days.some((d) => d.guadagno > 0) ? (
        <Animated.View style={s2}>
          <GlassCard style={styles.section} glow>
            <Text style={styles.sectionTitle}>Ultimi 7 giorni</Text>
            <AnimatedBarChart data={stats.last7Days} />
          </GlassCard>
        </Animated.View>
      ) : (
        <Animated.View style={s2}>
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Ultimi 7 giorni</Text>
            <View style={styles.emptyChart}>
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Nessuna sessione questa settimana</Text>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* ── RING CHART ── */}
      {ringSegments.length > 0 && (
        <Animated.View style={s3}>
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
      <Animated.View style={s4}>
        <Text style={styles.sectionTitle2}>Sessioni recenti</Text>
        {ultimeSessioni.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nessuna sessione"
            subtitle='Usa il tasto "Registra lavoro" qui sopra'
          />
        ) : (
          <View style={styles.sessionList}>
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

  hero: { paddingHorizontal: 8, paddingBottom: 20 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  monthLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
    minWidth: 190,
    textAlign: 'center',
  },
  heroEarnings: { alignItems: 'center', gap: 6, paddingHorizontal: 24 },
  heroLabel: { color: Colors.textSecondary, fontSize: 13, letterSpacing: 0.5 },
  heroAmount: {
    color: Colors.text,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -1.5,
    textShadowColor: Colors.primary,
    textShadowRadius: 24,
    textShadowOffset: { width: 0, height: 0 },
  } as any,
  heroDivider: {
    width: 56,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    marginTop: 4,
    opacity: 0.7,
  },

  // Quick register
  quickRegWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  quickRegGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  quickRegIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRegText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  section: { margin: 16, padding: 20, marginBottom: 0 },
  sectionTitle: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  sectionTitle2: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyChart: { height: 80, alignItems: 'center', justifyContent: 'center' },
  sessionList: { paddingHorizontal: 16, gap: 4 },
});
