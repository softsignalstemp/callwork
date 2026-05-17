import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { formatEuro } from '@/utils/formatters';
import type { Datore } from '@/db/types';

interface DatoreCardProps {
  datore: Datore;
  guadagnoMese?: number;
  numSessioni?: number;
  onPress?: () => void;
  onDelete?: () => void;
}

export function DatoreCard({ datore, guadagnoMese = 0, numSessioni = 0, onPress, onDelete }: DatoreCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.card, { shadowColor: datore.colore }]}>
      <LinearGradient
        colors={[datore.colore + '18', Colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.colorBar, { backgroundColor: datore.colore }]} />
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.nome}>{datore.nome}</Text>
          <View style={[styles.pill, { backgroundColor: datore.colore + '33' }]}>
            <Text style={[styles.pillText, { color: datore.colore }]}>
              {formatEuro(datore.pagaOraria)}/h
            </Text>
          </View>
        </View>
        <View style={styles.stats}>
          <Text style={styles.stat}>{numSessioni} sessioni</Text>
          <Text style={[styles.guadagno, { color: datore.colore }]}>
            {formatEuro(guadagnoMese)} questo mese
          </Text>
        </View>
      </View>
      {onDelete && (
        <IconButton
          icon="delete-outline"
          size={18}
          iconColor={Colors.textMuted}
          onPress={onDelete}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    overflow: 'hidden',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  colorBar: { width: 4, alignSelf: 'stretch' },
  info: { flex: 1, padding: 14, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nome: { color: Colors.text, fontWeight: '700', fontSize: 15, flex: 1 },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  stat: { color: Colors.textMuted, fontSize: 12 },
  guadagno: { fontWeight: '700', fontSize: 13 },
});
