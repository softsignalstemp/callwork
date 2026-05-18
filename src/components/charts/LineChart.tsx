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
const DOT_R = 4.5;
const HIT_R = 22;

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrichedPoint extends DayData {
  cumulative: number;   // running total up to this day
  isPast: boolean;      // true if date <= today
  x: number;
  y: number | null;     // null for future days (no line drawn)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildEnrichedPoints(
  data: DayData[],
  chartW: number,
  chartH: number,
  maxCumulative: number,
  todayStr: string
): EnrichedPoint[] {
  let running = 0;
  const n = data.length;
  return data.map((d, i) => {
    const isPast = d.date <= todayStr;
    if (isPast) running += d.guadagno;
    const cumulative = running; // future days hold last known total
    const x = PAD_H + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2);
    const y = isPast
      ? PAD_TOP + (1 - cumulative / maxCumulative) * chartH
      : null;
    return { ...d, cumulative, isPast, x, y };
  });
}

function buildLinePath(pts: EnrichedPoint[]): string {
  const active = pts.filter((p): p is EnrichedPoint & { y: number } => p.y !== null);
  return active.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function buildAreaPath(pts: EnrichedPoint[], chartBottom: number): string {
  const active = pts.filter((p): p is EnrichedPoint & { y: number } => p.y !== null);
  if (active.length === 0) return '';
  const line = active.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = active[active.length - 1];
  const first = active[0];
  return `${line} L${last.x.toFixed(1)},${chartBottom.toFixed(1)} L${first.x.toFixed(1)},${chartBottom.toFixed(1)} Z`;
}

function calcPathLength(pts: EnrichedPoint[]): number {
  const active = pts.filter((p): p is EnrichedPoint & { y: number } => p.y !== null);
  let len = 0;
  for (let i = 1; i < active.length; i++) {
    const dx = active[i].x - active[i - 1].x;
    const dy = active[i].y - active[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.max(len, 1);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface LineChartProps {
  data: DayData[];   // full month, all days
  height?: number;
}

export function LineChart({ data, height = 210 }: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const progress = useSharedValue(0);

  const chartW = width - PAD_H * 2;
  const chartH = height - PAD_TOP - PAD_BOTTOM;
  const chartBottom = PAD_TOP + chartH;
  const todayStr = new Date().toISOString().slice(0, 10);

  // Max cumulative value for scaling
  let running = 0;
  const maxCumulative = Math.max(
    ...data.map(d => { if (d.date <= todayStr) running += d.guadagno; return running; }),
    1
  ) * 1.1;

  const pts = width > 0
    ? buildEnrichedPoints(data, chartW, chartH, maxCumulative, todayStr)
    : [];

  const activePts = pts.filter(p => p.isPast);
  const linePath = buildLinePath(pts);
  const areaPath = buildAreaPath(pts, chartBottom);
  const pathLength = calcPathLength(pts);

  useEffect(() => {
    if (width === 0 || activePts.length === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [width, data.length]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  const selectedPt = selected !== null ? pts[selected] : null;

  // X-axis label indices: every 5 days + first + last
  const labelIndices = new Set<number>([0]);
  for (let i = 4; i < data.length; i += 5) labelIndices.add(i);
  labelIndices.add(data.length - 1);

  return (
    <TouchableWithoutFeedback onPress={() => setSelected(null)}>
      <View
        style={[styles.container, { height }]}
        onLayout={e => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && activePts.length > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.3" />
                <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
              </SvgGradient>
            </Defs>

            {/* Area fill */}
            <Path d={areaPath} fill="url(#areaFill)" />

            {/* Dashed future extension line (flat from last active to end of month) */}
            {activePts.length > 0 && activePts.length < pts.length && (() => {
              const lastActive = activePts[activePts.length - 1];
              const lastPt = pts[pts.length - 1];
              return (
                <Line
                  x1={lastActive.x}
                  y1={lastActive.y!}
                  x2={lastPt.x}
                  y2={lastActive.y!}
                  stroke={Colors.border}
                  strokeWidth={1.5}
                  strokeDasharray="4 5"
                  opacity={0.5}
                />
              );
            })()}

            {/* Animated draw-in line */}
            {activePts.length > 1 && (
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
            )}

            {/* Dots — only past days with earnings */}
            {pts.map((p, i) => {
              if (!p.isPast) return null;
              const isSelected = selected === i;
              const hasEarnings = p.guadagno > 0;
              return (
                <React.Fragment key={p.date}>
                  {isSelected && (
                    <Circle cx={p.x} cy={p.y!} r={14} fill={Colors.primaryGlow} opacity={0.15} />
                  )}
                  <Circle
                    cx={p.x}
                    cy={p.y!}
                    r={isSelected ? DOT_R + 1.5 : hasEarnings ? DOT_R : 2.5}
                    fill={isSelected ? Colors.primaryGlow : hasEarnings ? Colors.primary : Colors.border}
                    stroke={isSelected ? Colors.primaryGlow : Colors.card}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <Circle
                    cx={p.x}
                    cy={p.y!}
                    r={HIT_R}
                    fill="transparent"
                    onPress={() => setSelected(selected === i ? null : i)}
                  />
                </React.Fragment>
              );
            })}

            {/* Vertical dashed line on selected */}
            {selectedPt?.y != null && (
              <Line
                x1={selectedPt.x} y1={PAD_TOP}
                x2={selectedPt.x} y2={chartBottom}
                stroke={Colors.primaryGlow}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.4}
              />
            )}

            {/* X-axis day labels */}
            {pts.filter((_, i) => labelIndices.has(i)).map((p, _, arr) => {
              const isSelected = selected !== null && pts[selected].day === p.day;
              return (
                <SvgText
                  key={`lbl-${p.day}`}
                  x={p.x}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill={isSelected ? Colors.primaryGlow : p.isPast ? Colors.textMuted : Colors.border}
                  fontWeight={isSelected ? '700' : '400'}
                >
                  {p.day}
                </SvgText>
              );
            })}
          </Svg>
        )}

        {/* Single dot fallback (day 1 only) */}
        {width > 0 && activePts.length === 1 && (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Circle
              cx={activePts[0].x}
              cy={activePts[0].y!}
              r={DOT_R + 2}
              fill={Colors.primary}
              stroke={Colors.card}
              strokeWidth={2}
            />
            <SvgText
              x={activePts[0].x}
              y={activePts[0].y! - 12}
              textAnchor="middle"
              fontSize={11}
              fill={Colors.primaryGlow}
              fontWeight="700"
            >
              {formatEuro(activePts[0].cumulative)}
            </SvgText>
          </Svg>
        )}

        {/* Tooltip */}
        {selectedPt?.y != null && selected !== null && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(4, Math.min(selectedPt.x - 52, width - 116)),
                top: Math.max(2, selectedPt.y - 72),
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipDate}>
              {data[selected].date.slice(8)}/{data[selected].date.slice(5, 7)}
            </Text>
            <Text style={styles.tooltipValue}>
              {formatEuro(pts[selected].cumulative)}
            </Text>
            {data[selected].guadagno > 0 && (
              <Text style={styles.tooltipDaily}>
                +{formatEuro(data[selected].guadagno)} oggi
              </Text>
            )}
          </View>
        )}

        {width > 0 && activePts.length === 0 && (
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
    gap: 1,
    minWidth: 108,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tooltipDate: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  tooltipValue: { color: Colors.primaryGlow, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  tooltipDaily: { color: Colors.worked, fontSize: 10, fontWeight: '600' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
});
