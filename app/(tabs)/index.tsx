import React, { useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLavoriStore } from '@/store/useLavoriStore';
import { useMonthlyStats } from '@/hooks/useMonthlyStats';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { LiveShiftCard } from '@/components/jobs/LiveShiftCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LineChart } from '@/components/charts/LineChart';
import { RingChart } from '@/components/charts/RingChart';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { hapticSelection } from '@/utils/haptics';
import { formatEuro, formatOre, monthLabel, prevMonth, nextMonth } from '@/utils/formatters';
import { DecorShape } from '@/components/ui/DecorShape';
import { Colors } from '@/constants/colors';

function StatPill({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <View style={[pill.wrap, { borderColor: accent + '33' }]}>
      <BlurView intensity={Platform.OS === 'ios' ? 40 : 0} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: accent + '14', borderRadius: 16 }]} />
      <View style={pill.shine} />
      <Text style={[pill.value, { color: accent }]}>{value}</Text>
      <Text style={pill.label}>{label}</Text>
    </View>
  );
}

function useFadeIn(delayMs = 0) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 400 }));
  }, []);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meseSelezionato, cambiaMese, datori, sessioni, caricaDati } = useLavoriStore();
  const stats = useMonthlyStats();
  const [refreshing, setRefreshing] = React.useState(false);
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  const s0 = useFadeIn(0);
  const s1 = useFadeIn(100);
  const s2 = useFadeIn(180);
  const s3 = useFadeIn(260);
  const s4 = useFadeIn(340);

  useFocusEffect(
    useCallback(() => {
      caricaDati();
    }, [caricaDati])
  );

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
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom, gap: 12 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* ── HERO ── */}
      {/* Hero decorative shapes (absolute, behind content) */}
      <DecorShape shape="shard" size={140} color={Colors.primary} opacity={0.12} rotate={-30}
        style={{ position: 'absolute', top: insets.top + 10, right: -24, zIndex: 0 }} />
      <DecorShape shape="quad" size={48} color={Colors.primaryGlow} opacity={0.18} rotate={22}
        style={{ position: 'absolute', top: insets.top + 80, left: 24, zIndex: 0 }} />
      <LinearGradient
        colors={[Colors.primaryMuted + 'DD', Colors.primaryMuted + '55', 'transparent']}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.monthRow}>
          <IconButton icon="chevron-left" iconColor={Colors.textSecondary} size={22}
            onPress={() => { hapticSelection(); cambiaMese(prevMonth(meseSelezionato)); }} />
          <Text style={styles.monthLabel}>{monthLabel(meseSelezionato)}</Text>
          <IconButton icon="chevron-right" iconColor={Colors.textSecondary} size={22}
            onPress={() => { hapticSelection(); cambiaMese(nextMonth(meseSelezionato)); }} />
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

      {/* ── LINE CHART + STAT PILLS ── */}
      <Animated.View style={s1}>
        <GlassCard style={styles.section} glow>
          <Text style={styles.sectionTitle}>Andamento del mese</Text>
          <LineChart data={stats.daysOfMonth} onScrollLock={(locked) => setScrollEnabled(!locked)} />
          <View style={styles.chartDivider} />
          <View style={styles.pillRow}>
            <StatPill value={formatOre(stats.oreTotali)} label="Ore lavorate" accent={Colors.primary} />
            <StatPill value={String(stats.giorniLavorati)} label="Giorni lavorati" accent={Colors.confirmed} />
          </View>
        </GlassCard>
      </Animated.View>

      {/* ── LIVE SHIFT ── */}
      <LiveShiftCard sessioni={sessioni} datori={datori} />

      {/* ── QUICK REGISTER BUTTON ── */}
      <Animated.View style={[styles.quickRegWrap, s2]}>
        <GlassButton onPress={() => router.push('/lavori/registra')} style={styles.quickRegBtn}>
          <View style={styles.quickRegInner}>
            <View style={styles.quickRegIcon}>
              <MaterialCommunityIcons name="plus" size={22} color={Colors.primaryGlow} />
            </View>
            <Text style={styles.quickRegText}>Registra lavoro</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </View>
        </GlassButton>
      </Animated.View>

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
        <Text style={styles.sectionTitle2}>Turni recenti</Text>
        {ultimeSessioni.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nessun turno"
            subtitle='Usa il tasto "Registra lavoro" qui sopra'
          />
        ) : (
          <View>
            <View style={styles.sessionList}>
              {ultimeSessioni.map((s) => {
                const d = datori.find((d) => d.id === s.datoreId);
                return (
                  <SessioneCard
                    key={s.id}
                    sessione={s}
                    nomeAdatore={d?.nome}
                    coloreDatore={d?.colore}
                  />
                );
              })}
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  hero: { paddingHorizontal: 8, paddingBottom: 16 },
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
  },
  heroDivider: {
    width: 56,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    marginTop: 4,
    opacity: 0.7,
  },

  // Quick register
  quickRegWrap: { paddingHorizontal: 16 },
  quickRegBtn: {
    width: '100%',
  },
  quickRegInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  quickRegIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: Colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  quickRegText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  pillRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 6,
    marginBottom: -15,
    marginHorizontal: -15,
  },

  section: { marginHorizontal: 16, padding: 20 },
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
    marginBottom: 10,
  },
  chartDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginTop: 14,
    marginHorizontal: -20,
    opacity: 0.8,
  },
  emptyChart: { height: 80, alignItems: 'center', justifyContent: 'center' },
  sessionList: { paddingHorizontal: 16, gap: 4 },
});

const pill = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 6,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: '#ffffff',
    opacity: 0.15,
    borderRadius: 1,
  },
  value: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.2 },
});
