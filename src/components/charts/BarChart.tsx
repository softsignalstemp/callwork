import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

interface BarData {
  data: string;   // YYYY-MM-DD
  guadagno: number;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  color?: string;
}

export function BarChart({ data, height = 140, color }: BarChartProps) {
  const theme = useTheme();
  const barColor = color ?? theme.colors.primary;

  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.guadagno), 1);
  const width = 320;
  const paddingV = 20;
  const paddingH = 12;
  const barW = (width - paddingH * 2) / data.length - 4;
  const chartH = height - paddingV;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const barH = Math.max((d.guadagno / max) * (chartH - 16), d.guadagno > 0 ? 4 : 0);
          const x = paddingH + i * ((width - paddingH * 2) / data.length) + 2;
          const y = chartH - barH;

          return (
            <React.Fragment key={d.data}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill={barColor}
                opacity={d.guadagno > 0 ? 1 : 0.15}
              />
              <SvgText
                x={x + barW / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize={10}
                fill={theme.colors.onSurfaceVariant}
              >
                {d.data.slice(8)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
});
