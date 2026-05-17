import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  const theme = useTheme();
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
      <Text style={styles.icon}>{icon}</Text>
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
        {value}
      </Text>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 24,
  },
});
