import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  accent?: string;
}

export function StatCard({ icon, value, label, accent = Colors.primary }: StatCardProps) {
  return (
    <View style={[styles.card, { shadowColor: accent }]}>
      <LinearGradient
        colors={[Colors.cardAlt, Colors.card]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.iconBadge, { backgroundColor: accent + '22' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {/* Bottom accent line */}
      <View style={[styles.bottomLine, { backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 6,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  icon: { fontSize: 18 },
  value: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  label: { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.2 },
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
});
