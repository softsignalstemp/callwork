import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(isFinite(h) ? h : 8, isFinite(m) ? m : 0, 0, 0);
  return d;
}

function dateToTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${GIORNI[date.getDay()]} ${d} ${MESI[m - 1]} ${y}`;
}

// ─── Field tap row ────────────────────────────────────────────────────────────

interface FieldRowProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  open: boolean;
  onPress: () => void;
  accent: string;
}

function FieldRow({ icon, label, value, open, onPress, accent }: FieldRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.row, open && { borderColor: accent, borderWidth: 1.5 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, open && { color: accent }]}>{value}</Text>
      </View>
      <MaterialCommunityIcons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={open ? accent : Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// ─── TimePickerField ──────────────────────────────────────────────────────────

interface TimePickerFieldProps {
  label: string;
  value: string;          // "HH:MM"
  onChange: (v: string) => void;
  accent?: string;
}

export function TimePickerField({ label, value, onChange, accent = Colors.primary }: TimePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (selected) onChange(dateToTime(selected));
  };

  return (
    <View>
      <FieldRow
        icon="clock-outline"
        label={label}
        value={value}
        open={open}
        onPress={() => setOpen((v) => !v)}
        accent={accent}
      />
      {open && (
        <DateTimePicker
          value={timeToDate(value)}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          themeVariant="dark"
          style={styles.picker}
        />
      )}
    </View>
  );
}

// ─── DatePickerField ──────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  label?: string;
  value: string;          // "YYYY-MM-DD"
  onChange: (v: string) => void;
}

export function DatePickerField({ label = 'Data', value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (selected) onChange(dateToIso(selected));
  };

  return (
    <View>
      <FieldRow
        icon="calendar"
        label={label}
        value={formatDateLabel(value)}
        open={open}
        onPress={() => setOpen((v) => !v)}
        accent={Colors.confirmed}
      />
      {open && (
        <DateTimePicker
          value={isoToDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          themeVariant="dark"
          locale="it-IT"
          style={styles.picker}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rowValue: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  picker: {
    width: '100%',
    backgroundColor: Colors.card,
  },
});
