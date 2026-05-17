import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { formatEuro } from '@/utils/formatters';

interface BarData {
  data: string;
  guadagno: number;
}

const BAR_MAX_H = 110;
const BAR_WIDTH = 32;

interface BarItemProps {
  value: number;
  maxValue: number;
  label: string;
  index: number;
  isToday: boolean;
}

function BarItem({ value, maxValue, label, index, isToday }: BarItemProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 70,
      withSpring(maxValue > 0 ? value / maxValue : 0, { damping: 14, stiffness: 120 })
    );
  }, [value, maxValue]);

  const animStyle = useAnimatedStyle(() => ({
    height: Math.max(progress.value * BAR_MAX_H, value > 0 ? 4 : 2),
  }));

  return (
    <View style={styles.barWrapper}>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barOuter, animStyle]}>
          <LinearGradient
            colors={isToday
              ? [Colors.primaryGlow, Colors.primary]
              : value > 0
                ? [Colors.primary + 'CC', Colors.primaryDim + '99']
                : [Colors.border, Colors.border]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {isToday && value > 0 && (
            <View style={styles.todayGlow} />
          )}
        </Animated.View>
      </View>
      <Text
        variant="labelSmall"
        style={[styles.label, { color: isToday ? Colors.primaryGlow : Colors.textMuted }]}
      >
        {label}
      </Text>
    </View>
  );
}

interface AnimatedBarChartProps {
  data: BarData[];
}

export function AnimatedBarChart({ data }: AnimatedBarChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.guadagno), 1);
  const today = new Date().toISOString().slice(0, 10);
  const totalThisWeek = data.reduce((s, d) => s + d.guadagno, 0);

  return (
    <View style={styles.container}>
      {totalThisWeek > 0 && (
        <Text variant="labelMedium" style={styles.total}>
          {formatEuro(totalThisWeek)} questa settimana
        </Text>
      )}
      <View style={styles.chart}>
        {data.map((d, i) => (
          <BarItem
            key={d.data}
            value={d.guadagno}
            maxValue={maxValue}
            label={d.data.slice(8)}
            index={i}
            isToday={d.data === today}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  total: { color: Colors.textSecondary, textAlign: 'right' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_H + 24,
    paddingTop: 8,
  },
  barWrapper: { alignItems: 'center', flex: 1, gap: 6 },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: BAR_WIDTH,
  },
  barOuter: {
    width: BAR_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  label: { fontSize: 10 },
  todayGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primaryGlow,
    opacity: 0.15,
  },
});
