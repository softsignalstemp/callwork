import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { DayData } from '@/hooks/useMonthlyStats';
import { Colors } from '@/constants/colors';
import { formatEuro } from '@/utils/formatters';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const PAD_H = 12;
const PAD_TOP = 20;
const PAD_BOTTOM = 28;
const DOT_R = 4;
const HIT_R = 20;

interface Point extends DayData {
  x: number;
  y: number;
}

function buildPoints(data: DayData[], chartW: number, chartH: number, maxVal: number): Point[] {
  if (data.length === 0) return [];
  const spanX = data.length > 1 ? data.length - 1 : 1;
  return data.map((d, i) => ({
    ...d,
    x: PAD_H + (i / spanX) * chartW,
    y: PAD_TOP + (1 - d.guadagno / maxVal) * chartH,
  }));
}

function buildLinePath(pts: Point[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function buildAreaPath(pts: Point[], chartBottom: number): string {
  if (pts.length === 0) return '';
  const line = buildLinePath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${last.x.toFixed(1)},${chartBottom.toFixed(1)} L${first.x.toFixed(1)},${chartBottom.toFixed(1)} Z`;
}

function calcPathLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.max(len, 1);
}

interface LineChartProps {
  data: DayData[];
  height?: number;
}

export function LineChart({ data, height = 210 }: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const progress = useSharedValue(0);

  const chartW = width - PAD_H * 2;
  const chartH = height - PAD_TOP - PAD_BOTTOM;
  const chartBottom = PAD_TOP + chartH;
  const maxVal = Math.max(...data.map((d) => d.guadagno), 1) * 1.1;

  const pts = width > 0 ? buildPoints(data, chartW, chartH, maxVal) : [];
  const linePath = buildLinePath(pts);
  const areaPath = buildAreaPath(pts, chartBottom);
  const pathLength = calcPathLength(pts);

  useEffect(() => {
    if (width === 0 || pts.length === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [width, data.length]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  const selectedPt = selected !== null ? pts[selected] : null;

  // X-axis labels: show every ~5 days, always show last
  const labelIndices = new Set<number>();
  for (let i = 0; i < pts.length; i += 5) labelIndices.add(i);
  if (pts.length > 0) labelIndices.add(pts.length - 1);

  return (
    <TouchableWithoutFeedback onPress={() => setSelected(null)}>
      <View
        style={[styles.container, { height }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && pts.length > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.28" />
                <Stop offset="85%" stopColor={Colors.primary} stopOpacity="0" />
              </SvgGradient>
            </Defs>

            {/* Area fill — not animated, appears immediately */}
            <Path d={areaPath} fill="url(#areaFill)" />

            {/* Animated draw-in line */}
            <AnimatedPath
              animatedProps={animatedLineProps}
              d={linePath}
              stroke={Colors.primary}
              strokeWidth={2.5}
              strokeDasharray={`${pathLength} ${pathLength}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {pts.map((p, i) => {
              const isSelected = selected === i;
              const hasEarnings = p.guadagno > 0;
              return (
                <React.Fragment key={p.date}>
                  {/* Outer glow ring on selected */}
                  {isSelected && (
                    <Circle cx={p.x} cy={p.y} r={13} fill={Colors.primaryGlow} opacity={0.18} />
                  )}
                  {/* Dot */}
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? DOT_R + 1.5 : hasEarnings ? DOT_R : 2}
                    fill={isSelected ? Colors.primaryGlow : hasEarnings ? Colors.primary : Colors.border}
                    stroke={isSelected ? Colors.primaryGlow : Colors.card}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  {/* Invisible large hit target */}
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={HIT_R}
                    fill="transparent"
                    onPress={() => setSelected(selected === i ? null : i)}
                  />
                </React.Fragment>
              );
            })}

            {/* Vertical dashed line on selected */}
            {selectedPt && (
              <Line
                x1={selectedPt.x}
                y1={PAD_TOP}
                x2={selectedPt.x}
                y2={chartBottom}
                stroke={Colors.primaryGlow}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.45}
              />
            )}

            {/* X-axis day labels */}
            {pts.filter((_, i) => labelIndices.has(i)).map((p) => (
              <SvgText
                key={`lbl-${p.day}`}
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                fontSize={10}
                fill={selected !== null && pts[selected].day === p.day
                  ? Colors.primaryGlow
                  : Colors.textMuted}
                fontWeight={selected !== null && pts[selected].day === p.day ? '700' : '400'}
              >
                {p.day}
              </SvgText>
            ))}
          </Svg>
        )}

        {/* Tooltip */}
        {selectedPt && selected !== null && (
          <View
            style={[
              styles.tooltip,
              {
                // Clamp so tooltip never goes off-screen
                left: Math.max(4, Math.min(selectedPt.x - 52, width - 112)),
                top: Math.max(2, selectedPt.y - 68),
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipDate}>
              {data[selected].date.slice(8)}/{data[selected].date.slice(5, 7)}
            </Text>
            <Text style={styles.tooltipValue}>
              {formatEuro(data[selected].guadagno)}
            </Text>
          </View>
        )}

        {width > 0 && pts.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Nessuna sessione questo mese</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },

  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.cardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
    minWidth: 100,
    // Shadow/glow
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tooltipDate: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tooltipValue: {
    color: Colors.primaryGlow,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
});
