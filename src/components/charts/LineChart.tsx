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
const PAD_TOP = 24;
const PAD_BOTTOM = 28;
const DOT_R = 4.5;
const HIT_R = 22;

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface Point extends DayData {
  cumulative: number;
  x: number;
  y: number;
}

function buildPoints(data: DayData[], chartW: number, chartH: number, maxVal: number): Point[] {
  const n = data.length;
  let running = 0;
  return data.map((d, i) => {
    running += d.guadagno;
    return {
      ...d,
      cumulative: running,
      x: PAD_H + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2),
      y: PAD_TOP + (1 - running / maxVal) * chartH,
    };
  });
}

function linePath(pts: Point[]): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function areaPath(pts: Point[], bottom: number): string {
  if (!pts.length) return '';
  const line = linePath(pts);
  return `${line} L${pts.at(-1)!.x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`;
}

function pathLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.max(len, 1);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface LineChartProps {
  data: DayData[];
  height?: number;
}

export function LineChart({ data, height = 200 }: LineChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const progress = useSharedValue(0);

  const chartW = width - PAD_H * 2;
  const chartH = height - PAD_TOP - PAD_BOTTOM;
  const bottom = PAD_TOP + chartH;

  // cumulative max for scaling
  let running = 0;
  const maxVal = Math.max(
    ...data.map(d => { running += d.guadagno; return running; }),
    1
  ) * 1.1;

  const pts = width > 0 ? buildPoints(data, chartW, chartH, maxVal) : [];
  const lPath = linePath(pts);
  const aPath = areaPath(pts, bottom);
  const pLen = pathLength(pts);

  useEffect(() => {
    if (!width || !pts.length) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) });
  }, [width, data.length]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: pLen * (1 - progress.value),
  }));

  const sel = selected !== null ? pts[selected] : null;

  // Label every 5 days starting from 1, always show last
  const labelSet = new Set<number>([0]);
  for (let i = 4; i < pts.length; i += 5) labelSet.add(i);
  if (pts.length > 1) labelSet.add(pts.length - 1);

  if (width > 0 && pts.length === 0) {
    return (
      <View style={[styles.container, { height }]} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        <View style={styles.emptyWrap}><Text style={styles.emptyText}>Nessuna sessione questo mese</Text></View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setSelected(null)}>
      <View style={[styles.container, { height }]} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && pts.length > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <SvgGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.28" />
                <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
              </SvgGradient>
            </Defs>

            {/* Area fill */}
            <Path d={aPath} fill="url(#area)" />

            {/* Animated line (hidden when only 1 point) */}
            {pts.length > 1 && (
              <AnimatedPath
                animatedProps={animProps}
                d={lPath}
                stroke={Colors.primary}
                strokeWidth={2.5}
                strokeDasharray={`${pLen} ${pLen}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dots */}
            {pts.map((p, i) => {
              const isSelected = selected === i;
              const hasEarnings = p.guadagno > 0;
              return (
                <React.Fragment key={p.date}>
                  {isSelected && (
                    <Circle cx={p.x} cy={p.y} r={14} fill={Colors.primaryGlow} opacity={0.15} />
                  )}
                  <Circle
                    cx={p.x} cy={p.y}
                    r={isSelected ? DOT_R + 1.5 : hasEarnings ? DOT_R : 2.5}
                    fill={isSelected ? Colors.primaryGlow : hasEarnings ? Colors.primary : Colors.border}
                    stroke={isSelected ? Colors.primaryGlow : Colors.card}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <Circle cx={p.x} cy={p.y} r={HIT_R} fill="transparent"
                    onPress={() => setSelected(selected === i ? null : i)} />
                </React.Fragment>
              );
            })}

            {/* Selected vertical line */}
            {sel && (
              <Line x1={sel.x} y1={PAD_TOP} x2={sel.x} y2={bottom}
                stroke={Colors.primaryGlow} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
            )}

            {/* X-axis labels */}
            {pts.filter((_, i) => labelSet.has(i)).map((p) => (
              <SvgText key={`l${p.day}`} x={p.x} y={height - 6}
                textAnchor="middle" fontSize={10}
                fill={selected !== null && pts[selected].day === p.day ? Colors.primaryGlow : Colors.textMuted}
                fontWeight={selected !== null && pts[selected].day === p.day ? '700' : '400'}
              >
                {p.day}
              </SvgText>
            ))}

            {/* Single-point label */}
            {pts.length === 1 && (
              <SvgText x={pts[0].x} y={pts[0].y - 12} textAnchor="middle"
                fontSize={11} fill={Colors.primaryGlow} fontWeight="700">
                {formatEuro(pts[0].cumulative)}
              </SvgText>
            )}
          </Svg>
        )}

        {/* Tooltip */}
        {sel && selected !== null && (
          <View style={[styles.tooltip, {
            left: Math.max(4, Math.min(sel.x - 54, width - 116)),
            top: Math.max(2, sel.y - 74),
          }]} pointerEvents="none">
            <Text style={styles.tooltipDate}>
              {data[selected].date.slice(8)}/{data[selected].date.slice(5, 7)}
            </Text>
            <Text style={styles.tooltipTotal}>{formatEuro(pts[selected].cumulative)}</Text>
            {data[selected].guadagno > 0 && (
              <Text style={styles.tooltipDaily}>+{formatEuro(data[selected].guadagno)}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
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
    minWidth: 108,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tooltipDate: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  tooltipTotal: { color: Colors.primaryGlow, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  tooltipDaily: { color: Colors.worked, fontSize: 10, fontWeight: '600' },
});
