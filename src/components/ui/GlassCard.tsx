import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  glowColor?: string;
}

export function GlassCard({ children, style, glow = false, glowColor = Colors.glowViolet }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        glow && {
          shadowColor: glowColor,
          shadowOpacity: 0.45,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: 12,
        },
        style,
      ]}
    >
      {/* Top gradient border line */}
      <View style={styles.topLine} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: Colors.primaryGlow,
    opacity: 0.3,
  },
});
