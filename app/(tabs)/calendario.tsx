import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { useLavoriStore } from '@/store/useLavoriStore';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { Colors } from '@/constants/colors';
import { generateId } from '@/utils/id';

type MarkedDate = { dots?: { key: string; color: string }[]; selected?: boolean; selectedColor?: string };

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const { sessioni, disponibilita, datori, aggiungiDisponibilita, rimuoviDisponibilita } = useLavoriStore();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, MarkedDate> = {};
    const addDot = (data: string, key: string, color: string) => {
      if (!marks[data]) marks[data] = { dots: [] };
      marks[data].dots!.push({ key, color });
    };
    for (const s of sessioni) {
      addDot(s.data, 'worked', Colors.worked);
      if (s.confermato) addDot(s.data, 'confirmed', Colors.confirmed);
    }
    for (const d of disponibilita) addDot(d.data, 'available', Colors.available);
    if (selectedDay) {
      marks[selectedDay] = { ...marks[selectedDay], selected: true, selectedColor: Colors.primary + '55' };
    }
    return marks;
  }, [sessioni, disponibilita, selectedDay]);

  const sessioniGiorno = sessioni.filter((s) => s.data === selectedDay);
  const dispGiorno = disponibilita.find((d) => d.data === selectedDay);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={[Colors.primaryMuted + '88', Colors.bg]} style={styles.header}>
        <Text style={styles.title}>Calendario</Text>
        <View style={styles.legenda}>
          {[
            { color: Colors.worked, label: 'Lavorato' },
            { color: Colors.confirmed, label: 'Confermato' },
            { color: Colors.available, label: 'Disponibile' },
          ].map(({ color, label }) => (
            <View key={label} style={styles.legendaItem}>
              <View style={[styles.legendaDot, { backgroundColor: color }]} />
              <Text style={styles.legendaLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: { dateString: string }) => setSelectedDay(day.dateString)}
        theme={{
          backgroundColor: Colors.bg,
          calendarBackground: Colors.bg,
          textSectionTitleColor: Colors.textMuted,
          dayTextColor: Colors.text,
          todayTextColor: Colors.primaryGlow,
          todayBackgroundColor: Colors.primaryMuted,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: '#fff',
          monthTextColor: Colors.text,
          arrowColor: Colors.primary,
          dotColor: Colors.primary,
          textDisabledColor: Colors.textMuted,
        }}
      />

      {selectedDay && (
        <ScrollView style={[styles.detail, { backgroundColor: Colors.surface }]}>
          <Text style={styles.detailTitle}>{selectedDay}</Text>
          <Divider style={{ backgroundColor: Colors.border, marginBottom: 12 }} />

          {sessioniGiorno.length > 0 && (
            <View style={{ gap: 6, marginBottom: 12 }}>
              <Text style={styles.detailSection}>Sessioni</Text>
              {sessioniGiorno.map((s) => (
                <SessioneCard
                  key={s.id}
                  sessione={s}
                  nomeAdatore={datori.find((d) => d.id === s.datoreId)?.nome}
                  coloreDatore={datori.find((d) => d.id === s.datoreId)?.colore}
                />
              ))}
            </View>
          )}

          {dispGiorno && (
            <View style={styles.dispBadge}>
              <Text style={{ color: Colors.available, fontSize: 13 }}>
                ● Disponibile {dispGiorno.note ? `· ${dispGiorno.note}` : ''}
              </Text>
            </View>
          )}

          <Button
            mode={dispGiorno ? 'outlined' : 'contained'}
            onPress={() => {
              if (selectedDay) dispGiorno ? rimuoviDisponibilita(selectedDay) : aggiungiDisponibilita(selectedDay);
            }}
            icon={dispGiorno ? 'calendar-remove' : 'calendar-plus'}
            style={{ marginTop: 16 }}
            buttonColor={Colors.primary}
            textColor="#fff"
          >
            {dispGiorno ? 'Rimuovi disponibilità' : 'Segna disponibilità'}
          </Button>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8, gap: 10 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  legenda: { flexDirection: 'row', gap: 16 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaDot: { width: 8, height: 8, borderRadius: 4 },
  legendaLabel: { color: Colors.textSecondary, fontSize: 12 },
  detail: { flex: 1, padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  detailTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  detailSection: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  dispBadge: { backgroundColor: Colors.available + '22', padding: 10, borderRadius: 10 },
});
