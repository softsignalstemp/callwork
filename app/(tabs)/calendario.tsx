import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Divider, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useLavoriStore } from '@/store/useLavoriStore';
import { SessioneCard } from '@/components/jobs/SessioneCard';
import { Colors } from '@/constants/colors';
import { today } from '@/utils/formatters';
import { generateId } from '@/utils/id';

type MarkedDate = {
  dots?: { key: string; color: string }[];
  selected?: boolean;
  selectedColor?: string;
};

export default function CalendarioScreen() {
  const theme = useTheme();
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

    for (const d of disponibilita) {
      addDot(d.data, 'available', Colors.available);
    }

    if (selectedDay) {
      marks[selectedDay] = {
        ...marks[selectedDay],
        selected: true,
        selectedColor: theme.colors.primary + '33',
      };
    }

    return marks;
  }, [sessioni, disponibilita, selectedDay, theme]);

  const sessioniGiorno = sessioni.filter((s) => s.data === selectedDay);
  const dispGiorno = disponibilita.find((d) => d.data === selectedDay);

  const toggleDisponibilita = () => {
    if (!selectedDay) return;
    if (dispGiorno) {
      rimuoviDisponibilita(selectedDay);
    } else {
      aggiungiDisponibilita(selectedDay);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Legenda */}
      <View style={styles.legenda}>
        <LegendaItem color={Colors.worked} label="Lavorato" />
        <LegendaItem color={Colors.confirmed} label="Confermato" />
        <LegendaItem color={Colors.available} label="Disponibile" />
      </View>

      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: { dateString: string }) => setSelectedDay(day.dateString)}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.onSurfaceVariant,
          dayTextColor: theme.colors.onBackground,
          todayTextColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#fff',
          monthTextColor: theme.colors.onBackground,
          arrowColor: theme.colors.primary,
        }}
      />

      {/* Dettaglio giorno selezionato */}
      {selectedDay && (
        <ScrollView style={[styles.detail, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8, fontWeight: '700' }}>
            {selectedDay}
          </Text>
          <Divider />

          {sessioniGiorno.length > 0 && (
            <View style={{ marginTop: 12, gap: 6 }}>
              <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                Sessioni
              </Text>
              {sessioniGiorno.map((s) => (
                <SessioneCard
                  key={s.id}
                  sessione={s}
                  nomeAdatore={datori.find((d) => d.id === s.datoreId)?.nome}
                />
              ))}
            </View>
          )}

          {dispGiorno && (
            <View style={{ marginTop: 12 }}>
              <Text variant="labelLarge" style={{ color: Colors.available }}>
                ● Disponibile {dispGiorno.note ? `· ${dispGiorno.note}` : ''}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              mode={dispGiorno ? 'outlined' : 'contained-tonal'}
              onPress={toggleDisponibilita}
              icon={dispGiorno ? 'calendar-remove' : 'calendar-plus'}
              style={{ flex: 1 }}
            >
              {dispGiorno ? 'Rimuovi disponibilità' : 'Segna disponibilità'}
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function LegendaItem({ color, label }: { color: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  legenda: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12 },
  detail: { flex: 1, padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
