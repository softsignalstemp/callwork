import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { formatEuro, formatOre } from '@/utils/formatters';
import type { Sessione } from '@/db/types';

interface SessioneCardProps {
  sessione: Sessione;
  nomeAdatore?: string;
  onDelete?: () => void;
}

export function SessioneCard({ sessione, nomeAdatore, onDelete }: SessioneCardProps) {
  const statusColor = sessione.confermato ? Colors.confirmed : Colors.worked;

  return (
    <View style={styles.card}>
      {/* Left accent */}
      <View style={[styles.accent, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.nome}>{nomeAdatore ?? '—'}</Text>
            <Text style={styles.meta}>
              {sessione.data}  ·  {sessione.oraInizio} → {sessione.oraFine}
            </Text>
          </View>
          <View style={styles.amounts}>
            <Text style={[styles.guadagno, { color: statusColor }]}>
              {formatEuro(sessione.guadagno)}
            </Text>
            <Text style={styles.ore}>{formatOre(sessione.oreTotali)}</Text>
          </View>
        </View>

        {sessione.confermato && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ confermato</Text>
          </View>
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    overflow: 'hidden',
  },
  accent: { width: 3, alignSelf: 'stretch' },
  body: { flex: 1, padding: 14, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 3 },
  nome: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  meta: { color: Colors.textSecondary, fontSize: 12 },
  amounts: { alignItems: 'flex-end', gap: 2 },
  guadagno: { fontWeight: '800', fontSize: 15 },
  ore: { color: Colors.textMuted, fontSize: 12 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.confirmed + '22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: Colors.confirmed, fontSize: 10, fontWeight: '600' },
  deleteBtn: { marginRight: 4 },
});
