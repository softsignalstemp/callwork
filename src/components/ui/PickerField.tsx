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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${GIORNI[date.getDay()]} ${d} ${MESI[m - 1]} ${y}`;
}

// ─── Internal accordion card ──────────────────────────────────────────────────
// Row + picker form a single visual card. When open the row drops its bottom
// border and corners; the picker wrapper picks them up below.

interface AccordionPickerProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  displayValue: string;
  open: boolean;
  onToggle: () => void;
  accent: string;
  children: React.ReactNode; // the DateTimePicker
}

function AccordionPicker({ icon, label, displayValue, open, onToggle, accent, children }: AccordionPickerProps) {
  const borderColor = open ? accent : Colors.border;
  const borderWidth = open ? 1.5 : 1;

  return (
    <View>
      {/* ── Header row ── */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.75}
        style={[
          styles.row,
          {
            borderColor,
            borderWidth,
            // When open: square off bottom, no bottom border — visually joins the picker
            borderBottomLeftRadius: open ? 0 : 14,
            borderBottomRightRadius: open ? 0 : 14,
            borderBottomWidth: open ? 0 : borderWidth,
          },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
          <MaterialCommunityIcons name={icon} size={18} color={accent} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={[styles.rowValue, open && { color: accent }]}>{displayValue}</Text>
        </View>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? accent : Colors.textMuted}
        />
      </TouchableOpacity>

      {/* ── Expanded picker ── */}
      {open && (
        <View
          style={[
            styles.pickerWrapper,
            {
              borderColor,
              borderWidth,
              borderTopWidth: 0, // seamless join with row above
            },
          ]}
        >
          {/* Thin separator between row and picker */}
          <View style={[styles.pickerDivider, { backgroundColor: borderColor }]} />
          {children}
        </View>
      )}
    </View>
  );
}

// ─── TimePickerField ──────────────────────────────────────────────────────────

interface TimePickerFieldProps {
  label: string;
  value: string;
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
    <AccordionPicker
      icon="clock-outline"
      label={label}
      displayValue={value}
      open={open}
      onToggle={() => setOpen((v) => !v)}
      accent={accent}
    >
      <DateTimePicker
        value={timeToDate(value)}
        mode="time"
        is24Hour
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleChange}
        themeVariant="dark"
        style={styles.picker}
      />
    </AccordionPicker>
  );
}

// ─── DatePickerField ──────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}

export function DatePickerField({ label = 'Data', value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (selected) onChange(dateToIso(selected));
  };

  return (
    <AccordionPicker
      icon="calendar"
      label={label}
      displayValue={formatDateLabel(value)}
      open={open}
      onToggle={() => setOpen((v) => !v)}
      accent={Colors.confirmed}
    >
      <DateTimePicker
        value={isoToDate(value)}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleChange}
        themeVariant="dark"
        locale="it-IT"
        style={styles.picker}
      />
    </AccordionPicker>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
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

  pickerWrapper: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  pickerDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    opacity: 0.4,
  },
  picker: {
    width: '100%',
    backgroundColor: Colors.card,
  },
});
