/**
 * SimpleLineChart - works on both React Native and Web
 * Uses react-native-svg which is web-compatible
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function SimpleLineChart({
  data = [],
  width = 300,
  height = 160,
  color = '#3b82f6',
  labelColor = '#8B949E',
  backgroundColor = 'transparent',
  labels = [],
}) {
  if (!data || data.length < 2) {
    return (
      <View style={[{ width, height }, styles.placeholder]}>
        <Text style={[styles.placeholderText, { color: labelColor }]}>No data yet</Text>
      </View>
    );
  }

  const validData = data.filter(v => v != null && !isNaN(v));
  if (validData.length < 2) return null;

  const padding = { top: 16, bottom: 24, left: 8, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const min = Math.min(...validData) * 0.98;
  const max = Math.max(...validData) * 1.02;
  const range = max - min || 1;

  const xScale = (i) => padding.left + (i / (validData.length - 1)) * chartW;
  const yScale = (v) => padding.top + chartH - ((v - min) / range) * chartH;

  const points = validData.map((v, i) => ({ x: xScale(i), y: yScale(v) }));

  // Smooth line path
  const linePath = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    const prev = points[i - 1];
    const cpx = (prev.x + point.x) / 2;
    return `${path} C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, '');

  // Area fill path
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;

  const lastPoint = points[points.length - 1];
  const isPositive = validData[validData.length - 1] >= validData[0];
  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const gradId = `grad_${Math.random().toString(36).slice(2, 7)}`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Area fill */}
        <Path d={areaPath} fill={`url(#${gradId})`} />
        {/* Line */}
        <Path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* End dot */}
        <Circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill={lineColor} />
      </Svg>
      {/* Labels */}
      {labels.length > 0 && (
        <View style={[styles.labelsRow, { paddingHorizontal: padding.left }]}>
          {labels.map((l, i) => (
            <Text key={i} style={[styles.label, { color: labelColor }]}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 13 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  label: { fontSize: 10 },
});
