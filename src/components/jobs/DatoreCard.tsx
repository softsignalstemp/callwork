import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme, IconButton } from 'react-native-paper';
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
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={[styles.colorBar, { backgroundColor: datore.colore }]} />
        <View style={styles.info}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            {datore.nome}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatEuro(datore.pagaOraria)}/h · {numSessioni} sessioni
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
            Questo mese: {formatEuro(guadagnoMese)}
          </Text>
        </View>
        {onDelete && (
          <IconButton icon="delete-outline" size={20} onPress={onDelete} iconColor={theme.colors.error} />
        )}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    padding: 14,
    gap: 3,
  },
});
