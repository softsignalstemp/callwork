import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

// ─── shared row style ─────────────────────────────────────────────────────────

interface FieldRowProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  onPress: () => void;
  accent?: string;
}

export function FieldRow({ icon, label, value, onPress, accent = Colors.primary }: FieldRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── iOS bottom-sheet modal wrapper ───────────────────────────────────────────

interface IOSPickerModalProps {
  visible: boolean;
  title: string;
  onDone: () => void;
  children: React.ReactNode;
}

function IOSPickerModal({ visible, title, onDone, children }: IOSPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Button onPress={onDone} textColor={Colors.primary} compact>
              Fine
            </Button>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ─── Time Picker ──────────────────────────────────────────────────────────────

interface TimePickerFieldProps {
  label: string;
  value: string; // "HH:MM"
  onChange: (time: string) => void;
  accent?: string;
}

export function TimePickerField({ label, value, onChange, accent = Colors.primary }: TimePickerFieldProps) {
  const [show, setShow] = useState(false);

  const toDate = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(isFinite(h) ? h : 8, isFinite(m) ? m : 0, 0, 0);
    return d;
  };

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) {
      const h = String(selected.getHours()).padStart(2, '0');
      const m = String(selected.getMinutes()).padStart(2, '0');
      onChange(`${h}:${m}`);
    }
  };

  const picker = (
    <DateTimePicker
      value={toDate(value)}
      mode="time"
      is24Hour
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleChange}
      themeVariant="dark"
    />
  );

  return (
    <>
      <FieldRow
        icon="clock-outline"
        label={label}
        value={value}
        onPress={() => setShow(true)}
        accent={accent}
      />
      {Platform.OS === 'ios' ? (
        <IOSPickerModal visible={show} title={label} onDone={() => setShow(false)}>
          {picker}
        </IOSPickerModal>
      ) : (
        show && picker
      )}
    </>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────

interface DatePickerFieldProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (date: string) => void;
}

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatDateLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${GIORNI[date.getDay()]} ${d} ${MESI[m - 1]} ${y}`;
}

export function DatePickerField({ label = 'Data', value, onChange }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  const toDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    }
  };

  const picker = (
    <DateTimePicker
      value={toDate(value)}
      mode="date"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleChange}
      themeVariant="dark"
      locale="it-IT"
    />
  );

  return (
    <>
      <FieldRow
        icon="calendar"
        label={label}
        value={formatDateLabel(value)}
        onPress={() => setShow(true)}
        accent={Colors.confirmed}
      />
      {Platform.OS === 'ios' ? (
        <IOSPickerModal visible={show} title={label} onDone={() => setShow(false)}>
          {picker}
        </IOSPickerModal>
      ) : (
        show && picker
      )}
    </>
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
  rowLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  rowValue: { color: Colors.text, fontSize: 16, fontWeight: '600' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalTitle: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
