import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { formatEuro } from '@/utils/formatters';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface RingChartProps {
  segments: Segment[];
  centerLabel: string;
  centerValue: string;
  size?: number;
}

const STROKE_WIDTH = 18;
const GAP = 3; // degrees gap between segments

export function RingChart({ segments, centerLabel, centerValue, size = 180 }: RingChartProps) {
  const radius = (size - STROKE_WIDTH * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = segments.reduce((s, sg) => s + sg.value, 0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(1), 100);
    return () => clearTimeout(timer);
  }, []);

  // Build arc segments
  let currentAngle = -90; // start from top
  const arcs = segments.map((seg) => {
    const percentage = total > 0 ? seg.value / total : 0;
    const degrees = percentage * 360 - GAP;
    const startAngle = currentAngle;
    currentAngle += percentage * 360;

    const radStart = (startAngle * Math.PI) / 180;
    const radEnd = ((startAngle + degrees) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(radStart);
    const y1 = cy + radius * Math.sin(radStart);
    const x2 = cx + radius * Math.cos(radEnd);
    const y2 = cy + radius * Math.sin(radEnd);

    const largeArc = degrees > 180 ? 1 : 0;

    const dashLen = (degrees / 360) * circumference * progress;
    const totalArc = (degrees / 360) * circumference;

    return {
      ...seg,
      dashLen: dashLen * progress,
      totalArc,
      percentage,
    };
  });

  // Use stroke-dasharray approach for simplicity
  let offset = 0;
  const dashSegments = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const arcLen = pct * circumference - (GAP / 360) * circumference;
    const result = { ...seg, arcLen: Math.max(arcLen, 0), offset, pct };
    offset += pct * circumference;
    return result;
  });

  // Rotation: start from top (-90deg)
  const rotationOffset = -90;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={Colors.border}
          strokeWidth={STROKE_WIDTH}
        />
        {/* Animated segments */}
        {dashSegments.map((seg, i) => (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${seg.arcLen * progress} ${circumference}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            rotation={rotationOffset}
            origin={`${cx}, ${cy}`}
          />
        ))}
      </Svg>

      {/* Center text */}
      <View style={[styles.center, { width: size, height: size }]}>
        <Text variant="headlineSmall" style={{ color: Colors.text, fontWeight: '800' }}>
          {centerValue}
        </Text>
        <Text variant="labelSmall" style={{ color: Colors.textSecondary }}>
          {centerLabel}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text variant="labelSmall" style={{ color: Colors.textSecondary, flex: 1 }}>
              {seg.label}
            </Text>
            <Text variant="labelMedium" style={{ color: Colors.text }}>
              {formatEuro(seg.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  legend: { width: '100%', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
