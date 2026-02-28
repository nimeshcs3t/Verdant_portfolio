import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity
} from 'react-native';
import SimpleLineChart from '../components/SimpleLineChart';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchHistoricalData, fetchStockPrice, fetchCryptoPrice } from '../services/priceService';

const { width } = Dimensions.get('window');
const PERIODS = ['3M', '1Y', '5Y'];

export default function AssetDetailScreen({ route, navigation }) {
  const { theme, isValuesHidden } = useApp();
  const c = theme.colors;
  const { symbol, holding } = route.params;

  const [priceData, setPriceData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: symbol });
    loadData();
  }, [symbol]);

  useEffect(() => {
    loadChart();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const fn = holding.type === 'CRYPTO' ? fetchCryptoPrice : fetchStockPrice;
      const data = await fn(symbol);
      setPriceData(data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const loadChart = async () => {
    try {
      const rangeMap = { '3M': '3mo', '1Y': '1y', '5Y': '5y' };
      const data = await fetchHistoricalData(symbol, rangeMap[selectedPeriod], holding.type);
      if (data.length > 0) {
        const step = Math.max(1, Math.floor(data.length / 12));
        const sampled = data.filter((_, i) => i % step === 0).slice(-12);
        setChartData({
          labels: sampled.map(d => {
            const date = new Date(d.date);
            return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
          }),
          datasets: [{ data: sampled.map(d => d.price) }],
          // Also expose flat array for SimpleLineChart
          values: sampled.map(d => d.price),
        });
      }
    } catch (e) {}
  };

  const fv = (v) => {
    if (isValuesHidden) return '••••';
    return `$${parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fp = (v) => {
    if (isValuesHidden) return '••%';
    return `${v >= 0 ? '+' : ''}${parseFloat(v || 0).toFixed(2)}%`;
  };

  const gc = (v) => v >= 0 ? c.success : c.danger;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Price Header */}
            <View style={[styles.priceCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.assetIcon, { backgroundColor: c.cardSecondary }]}>
                <Text style={[styles.iconText, { color: c.primary }]}>{symbol.slice(0, 2)}</Text>
              </View>
              <View>
                <Text style={[styles.assetName, { color: c.textSecondary }]}>{holding.name}</Text>
                <Text style={[styles.currentPrice, { color: c.text }]}>{fv(priceData?.price || holding.currentPrice)}</Text>
                <Text style={[styles.priceChange, { color: gc(priceData?.changePercent || 0) }]}>
                  {fv(priceData?.change || 0)} ({fp(priceData?.changePercent || 0)}) Today
                </Text>
              </View>
            </View>

            {/* Your Position */}
            <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Your Position</Text>
              <View style={styles.metricsGrid}>
                {[
                  { label: 'Shares', value: holding.shares.toFixed(4), raw: true },
                  { label: 'Avg Cost', value: fv(holding.avgCost) },
                  { label: 'Current Value', value: fv(holding.currentValue) },
                  { label: 'Total Cost', value: fv(holding.totalCost) },
                  { label: 'Gain/Loss', value: fv(holding.gainLoss), colored: true, gainLoss: holding.gainLoss },
                  { label: 'Return', value: fp(holding.gainLossPct), colored: true, gainLoss: holding.gainLoss },
                ].map(m => (
                  <View key={m.label} style={[styles.metricCard, { backgroundColor: c.cardSecondary }]}>
                    <Text style={[styles.metricLabel, { color: c.textSecondary }]}>{m.label}</Text>
                    <Text style={[styles.metricValue, { color: m.colored ? gc(m.gainLoss) : c.text }]}>
                      {m.raw ? m.value : m.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Chart */}
            {chartData && (
              <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Price History</Text>
                <View style={styles.periodRow}>
                  {PERIODS.map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setSelectedPeriod(p)}
                      style={[styles.periodBtn, selectedPeriod === p && { backgroundColor: c.primary }]}
                    >
                      <Text style={[styles.periodText, { color: selectedPeriod === p ? '#fff' : c.textSecondary }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <SimpleLineChart
                  data={chartData?.values || chartData?.datasets?.[0]?.data || []}
                  labels={chartData?.labels || []}
                  width={width - 64}
                  height={160}
                  color={c.primary}
                  labelColor={c.textSecondary}
                />
              </View>
            )}

            {/* Market Data */}
            {priceData && (
              <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Market Data</Text>
                {[
                  { label: 'Market State', value: priceData.marketState || 'Regular' },
                  { label: 'Currency', value: priceData.currency || 'USD' },
                  { label: 'Prev. Close', value: fv(priceData.previousClose) },
                ].map(item => (
                  <View key={item.label} style={[styles.dataRow, { borderBottomColor: c.border }]}>
                    <Text style={[styles.dataLabel, { color: c.textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.dataValue, { color: c.text }]}>{item.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  priceCard: {
    margin: 16, borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  assetIcon: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 18, fontWeight: '700' },
  assetName: { fontSize: 13, marginBottom: 4 },
  currentPrice: { fontSize: 26, fontWeight: '800' },
  priceChange: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: { width: '30%', flex: 1, borderRadius: 12, padding: 12, minWidth: 100 },
  metricLabel: { fontSize: 11, marginBottom: 4 },
  metricValue: { fontSize: 14, fontWeight: '600' },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  periodText: { fontSize: 13, fontWeight: '500' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  dataLabel: { fontSize: 14 },
  dataValue: { fontSize: 14, fontWeight: '500' },
});
