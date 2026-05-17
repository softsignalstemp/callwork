import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { formatEuro, formatOre } from '@/utils/formatters';
import type { Sessione } from '@/db/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MESI_SHORT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function formatData(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${GIORNI[date.getDay()]} · ${d} ${MESI_SHORT[m - 1]}`;
}

function timeToH(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

// ─── Mini time-of-day bar ─────────────────────────────────────────────────────

function TimeBar({ oraInizio, oraFine, color }: { oraInizio: string; oraFine: string; color: string }) {
  const start = timeToH(oraInizio);
  const end = timeToH(oraFine);
  const startPct = Math.max(0, (start / 24) * 100);
  const widthPct = Math.max(0, Math.min(((end - start) / 24) * 100, 100 - startPct));

  return (
    <View style={barStyles.track}>
      {/* Worked window */}
      <View
        style={[
          barStyles.fill,
          {
            left: `${startPct}%` as any,
            width: `${widthPct}%` as any,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 2,
    opacity: 0.9,
  },
});

// ─── SessioneCard ─────────────────────────────────────────────────────────────

interface SessioneCardProps {
  sessione: Sessione;
  nomeAdatore?: string;
  coloreDatore?: string;
  onDelete?: () => void;
}

export function SessioneCard({ sessione, nomeAdatore, coloreDatore, onDelete }: SessioneCardProps) {
  const accentColor = coloreDatore ?? (sessione.confermato ? Colors.confirmed : Colors.worked);

  return (
    <View style={[styles.card, { shadowColor: accentColor }]}>
      {/* Left color accent */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* ── Row 1: datore + status ── */}
        <View style={styles.rowSpread}>
          <Text style={styles.nome} numberOfLines={1}>{nomeAdatore ?? '—'}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: sessione.confermato ? Colors.confirmed + '22' : Colors.available + '22' }
          ]}>
            <MaterialCommunityIcons
              name={sessione.confermato ? 'check-circle' : 'clock-outline'}
              size={11}
              color={sessione.confermato ? Colors.confirmed : Colors.available}
            />
            <Text style={[
              styles.statusText,
              { color: sessione.confermato ? Colors.confirmed : Colors.available }
            ]}>
              {sessione.confermato ? 'Confermato' : 'In attesa'}
            </Text>
          </View>
        </View>

        {/* ── Row 2: time range ── */}
        <View style={styles.timeRow}>
          <View style={styles.timePill}>
            <MaterialCommunityIcons name="clock-start" size={12} color={Colors.textMuted} />
            <Text style={styles.timeText}>{sessione.oraInizio}</Text>
          </View>
          <View style={styles.timeBarWrap}>
            <TimeBar
              oraInizio={sessione.oraInizio}
              oraFine={sessione.oraFine}
              color={accentColor}
            />
          </View>
          <View style={styles.timePill}>
            <Text style={styles.timeText}>{sessione.oraFine}</Text>
            <MaterialCommunityIcons name="clock-end" size={12} color={Colors.textMuted} />
          </View>
        </View>

        {/* ── Row 3: date + hours pill + earnings ── */}
        <View style={styles.rowSpread}>
          <Text style={styles.data}>{formatData(sessione.data)}</Text>
          <View style={styles.rowRight}>
            <View style={[styles.orePill, { backgroundColor: accentColor + '22' }]}>
              <Text style={[styles.oreText, { color: accentColor }]}>
                {formatOre(sessione.oreTotali)}
              </Text>
            </View>
            <Text style={[styles.guadagno, { color: accentColor }]}>
              {formatEuro(sessione.guadagno)}
            </Text>
          </View>
        </View>

        {/* ── Note (opzionale) ── */}
        {!!sessione.note && (
          <Text style={styles.note} numberOfLines={1}>
            <MaterialCommunityIcons name="note-text-outline" size={11} color={Colors.textMuted} />
            {' '}{sessione.note}
          </Text>
        )}
      </View>

      {onDelete && (
        <IconButton
          icon="delete-outline"
          size={18}
          iconColor={Colors.textMuted}
          onPress={onDelete}
          style={styles.deleteBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: 5,
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 14, gap: 9 },

  rowSpread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  nome: { color: Colors.text, fontWeight: '700', fontSize: 14, flex: 1 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 10, fontWeight: '700' },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  timeBarWrap: { flex: 1 },

  data: { color: Colors.textMuted, fontSize: 12 },
  orePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  oreText: { fontSize: 11, fontWeight: '700' },
  guadagno: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },

  note: { color: Colors.textMuted, fontSize: 11, fontStyle: 'italic' },
  deleteBtn: { alignSelf: 'center', marginRight: 4 },
});
