import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme, IconButton } from 'react-native-paper';
import { formatEuro, formatOre } from '@/utils/formatters';
import { Colors } from '@/constants/colors';
import type { Sessione } from '@/db/types';

interface SessioneCardProps {
  sessione: Sessione;
  nomeAdatore?: string;
  onDelete?: () => void;
}

export function SessioneCard({ sessione, nomeAdatore, onDelete }: SessioneCardProps) {
  const theme = useTheme();
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: sessione.confermato ? Colors.confirmed : Colors.worked }]} />
        <View style={styles.info}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {nomeAdatore ?? sessione.datoreId}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {sessione.data} · {sessione.oraInizio}–{sessione.oraFine}
          </Text>
        </View>
        <View style={styles.values}>
          <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            {formatEuro(sessione.guadagno)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatOre(sessione.oreTotali)}
          </Text>
        </View>
        {onDelete && (
          <IconButton icon="delete-outline" size={20} onPress={onDelete} iconColor={theme.colors.error} />
        )}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  values: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
