import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useLavoriStore } from '@/store/useLavoriStore';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { DecorShape } from '@/components/ui/DecorShape';
import { Colors } from '@/constants/colors';

type MarkedDate = { dots?: { key: string; color: string }[]; selected?: boolean; selectedColor?: string };

const LEGENDA = [
  { color: Colors.worked, label: 'Lavorato', icon: 'briefcase' as const },
  { color: Colors.confirmed, label: 'Confermato', icon: 'check-circle' as const },
  { color: Colors.available, label: 'Disponibile', icon: 'clock' as const },
];

function formatDateItalian(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const { sessioni, disponibilita, datori, aggiungiDisponibilita, rimuoviDisponibilita } = useLavoriStore();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, MarkedDate> = {};
    const addDot = (data: string, key: string, color: string) => {
      if (!marks[data]) marks[data] = { dots: [] };
      if (!marks[data].dots!.some((d) => d.key === key)) {
        marks[data].dots!.push({ key, color });
      }
    };
    for (const s of sessioni) {
      addDot(s.data, `${s.data}-worked`, Colors.worked);
      if (s.confermato) addDot(s.data, `${s.data}-confirmed`, Colors.confirmed);
    }
    for (const d of disponibilita) addDot(d.data, `${d.data}-available`, Colors.available);
    if (selectedDay) {
      marks[selectedDay] = { ...marks[selectedDay], selected: true, selectedColor: Colors.primary + '66' };
    }
    return marks;
  }, [sessioni, disponibilita, selectedDay]);

  const sessioniGiorno = sessioni.filter((s) => s.data === selectedDay);
  const dispGiorno = disponibilita.find((d) => d.data === selectedDay);

  return (
    <View style={styles.container}>
      {/* ── SFONDO GRADIENTE FULL SCREEN ── */}
      <LinearGradient
        colors={[Colors.primaryMuted + 'CC', Colors.bg, Colors.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0, y: 0.45 }}
      />

    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top, paddingBottom: 100 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <DecorShape shape="clover" size={88} color="#fb7185" opacity={0.1} rotate={-8}
          style={{ position: 'absolute', right: -16, top: 0 }} />
        <Text style={styles.title}>Calendario</Text>
        <View style={styles.legenda}>
          {LEGENDA.map(({ color, label }) => (
            <View key={label} style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: color }]} />
              <Text style={styles.legendaLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── CALENDARIO WIDGET ── */}
      <GlassCard style={styles.calendarCard} glow glowColor={Colors.primary}>
        {/* Shine top bar */}
        <LinearGradient
          colors={[Colors.primaryGlow + '33', 'transparent']}
          style={styles.cardShine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <Calendar
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) =>
            setSelectedDay((prev) => (prev === day.dateString ? null : day.dateString))
          }
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: Colors.textMuted,
            dayTextColor: Colors.text,
            todayTextColor: Colors.primaryGlow,
            todayBackgroundColor: Colors.primaryMuted + 'AA',
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: '#fff',
            monthTextColor: Colors.text,
            arrowColor: Colors.primary,
            dotColor: Colors.primary,
            textDisabledColor: Colors.textMuted + '88',
          }}
        />
      </GlassCard>

      {/* ── DETTAGLIO GIORNO / EMPTY STATE ── */}
      {selectedDay ? (
        <GlassCard style={styles.detailCard}>
          {/* Day header */}
          <View style={styles.dayHeader}>
            <View style={styles.dayHeaderLeft}>
              <View style={styles.dayDot} />
              <Text style={styles.dayTitle}>{formatDateItalian(selectedDay)}</Text>
            </View>
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={Colors.textMuted}
              onPress={() => setSelectedDay(null)}
            />
          </View>

          <View style={styles.dayDivider} />

          {/* Turni del giorno */}
          {sessioniGiorno.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Turni</Text>
              <View style={{ gap: 6 }}>
                {sessioniGiorno.map((s) => {
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

          {/* Badge disponibilità */}
          {dispGiorno && (
            <View style={styles.dispBadge}>
              <MaterialCommunityIcons name="clock-check-outline" size={15} color={Colors.available} />
              <Text style={styles.dispText}>
                Disponibile{dispGiorno.note ? ` · ${dispGiorno.note}` : ''}
              </Text>
            </View>
          )}

          {/* Bottone disponibilità */}
          <Button
            mode={dispGiorno ? 'outlined' : 'contained'}
            onPress={() => {
              if (selectedDay) dispGiorno ? rimuoviDisponibilita(selectedDay) : aggiungiDisponibilita(selectedDay);
            }}
            icon={dispGiorno ? 'calendar-remove' : 'calendar-plus'}
            style={styles.dispBtn}
            buttonColor={Colors.primary}
            textColor={dispGiorno ? Colors.textSecondary : '#fff'}
            contentStyle={{ paddingVertical: 4 }}
          >
            {dispGiorno ? 'Rimuovi disponibilità' : 'Segna disponibilità'}
          </Button>
        </GlassCard>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="gesture-tap" size={28} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Seleziona un giorno per segnare le tue disponibilità</Text>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { gap: 16 },

  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8, gap: 10 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  legenda: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendaDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendaLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '500' },

  calendarCard: { marginHorizontal: 16, overflow: 'hidden' },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    zIndex: 1,
  },

  detailCard: { marginHorizontal: 16, padding: 18, gap: 12 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  dayTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dayDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  section: { gap: 8 },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  dispBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.available + '18',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.available + '44',
  },
  dispText: { color: Colors.available, fontSize: 13, fontWeight: '500' },
  dispBtn: { borderRadius: 12 },

  emptyState: {
    marginHorizontal: 16,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
