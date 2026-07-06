import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline, Rect, Line } from 'react-native-svg';
import { useTheme } from 'react-native-paper';

export default function SimpleChart({ data, color, height = 100, type = 'line' }) {
  const theme = useTheme();

  if (!data || data.length === 0) return null;

  const width = 300;
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  if (type === 'bar') {
    const barWidth = Math.max(2, (chartWidth / data.length) - 2);

    return (
      <View style={[styles.container, { height }]}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <Line
            x1={padding} y1={height - padding}
            x2={width - padding} y2={height - padding}
            stroke={theme.colors.outlineVariant}
            strokeWidth={1}
          />
          {data.map((val, i) => {
            const x = padding + (i / data.length) * chartWidth;
            const barHeight = ((val - min) / range) * chartHeight;
            const y = height - padding - barHeight;
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity={0.8}
                rx={1}
              />
            );
          })}
        </Svg>
      </View>
    );
  }

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - ((val - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line
          x1={padding} y1={height - padding}
          x2={width - padding} y2={height - padding}
          stroke={theme.colors.outlineVariant}
          strokeWidth={1}
        />
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
