import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';

export default function AllocationScreen() {
  const { C, getMetrics, isHidden, transactions, addTransaction } = useApp();
  const insets = useSafeAreaInsets();
  const { holdings, totalValue } = getMetrics();
  const [targets, setTargets] = useState({});

  const fmt = (v) => isHidden ? '••••' : '$' + Math.abs(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getTarget = (sym) => targets[sym] !== undefined ? targets[sym] : (holdings.find(h => h.symbol === sym)?.targetAllocation || 0).toString();
  const totalTarget = holdings.reduce((s, h) => s + (+getTarget(h.symbol) || 0), 0);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.header, { backgroundColor: C.card, borderBottomColor: C.border, paddingTop: insets.top + 12 }]}>
        <Text style={[s.title, { color: C.text }]}>Allocation</Text>
        <View style={[s.badge, { backgroundColor: totalTarget <= 100 ? C.green + '20' : C.red + '20' }]}>
          <Text style={[s.badgeText, { color: totalTarget <= 100 ? C.green : C.red }]}>Target: {totalTarget.toFixed(0)}%</Text>
        </View>
      </View>

      {holdings.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🥧</Text>
          <Text style={[s.emptyTitle, { color: C.text }]}>No assets yet</Text>
          <Text style={[s.emptySub, { color: C.muted }]}>Add transactions to see allocation</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          {/* Summary cards */}
          <View style={s.statsRow}>
            <View style={[s.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statVal, { color: C.text }]}>{fmt(totalValue)}</Text>
              <Text style={[s.statLabel, { color: C.muted }]}>Total Value</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statVal, { color: C.text }]}>{holdings.length}</Text>
              <Text style={[s.statLabel, { color: C.muted }]}>Assets</Text>
            </View>
          </View>

          {/* Allocation rows */}
          {holdings.map(h => {
            const curPct = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
            const targPct = +getTarget(h.symbol) || 0;
            const diffVal = h.currentValue - (targPct / 100) * totalValue;
            const sharesToAct = h.currentPrice > 0 ? Math.abs(diffVal / h.currentPrice) : 0;
            const needBuy = diffVal < -1;
            const needSell = diffVal > 1;

            return (
              <View key={h.symbol} style={[s.allocCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={s.allocTop}>
                  <View>
                    <Text style={[s.sym, { color: C.text }]}>{h.symbol}</Text>
                    <Text style={[s.symName, { color: C.muted }]}>{h.shares.toFixed(4)} units</Text>
                  </View>
                  <View style={s.allocRight}>
                    <Text style={[s.allocVal, { color: C.text }]}>{fmt(h.currentValue)}</Text>
                    <Text style={[s.allocCurPct, { color: C.primary }]}>{curPct.toFixed(1)}% now</Text>
                  </View>
                </View>

                {/* Bars */}
                <View style={s.barsWrap}>
                  <View style={[s.barBg, { backgroundColor: C.card2 }]}>
                    {targPct > 0 && <View style={[s.barTarget, { width: `${Math.min(targPct, 100)}%`, backgroundColor: C.muted + '40' }]} />}
                    <View style={[s.barCur, { width: `${Math.min(curPct, 100)}%`, backgroundColor: C.primary }]} />
                  </View>
                </View>

                {/* Target input + action */}
                <View style={s.allocBottom}>
                  <View style={s.targetWrap}>
                    <Text style={[s.targetLabel, { color: C.muted }]}>Target %</Text>
                    <TextInput
                      style={[s.targetInput, { backgroundColor: C.card2, borderColor: C.border, color: C.text }]}
                      value={getTarget(h.symbol).toString()}
                      onChangeText={v => setTargets(prev => ({ ...prev, [h.symbol]: v }))}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={C.muted}
                    />
                  </View>
                  {targPct > 0 && (needBuy || needSell) && (
                    <View style={[s.actionChip, { backgroundColor: needBuy ? C.green + '20' : C.red + '20' }]}>
                      <Text style={[s.actionText, { color: needBuy ? C.green : C.red }]}>
                        {needBuy ? '📈 BUY' : '📉 SELL'} {sharesToAct.toFixed(4)} shares
                      </Text>
                    </View>
                  )}
                  {targPct > 0 && !needBuy && !needSell && (
                    <View style={[s.actionChip, { backgroundColor: C.green + '20' }]}>
                      <Text style={[s.actionText, { color: C.green }]}>✓ On target</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          <Text style={[s.hint, { color: C.muted }]}>💡 Blue bar = current allocation. Set target % to see how many shares to buy/sell. Pull down to refresh prices.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  badge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptySub: { fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  allocCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  allocTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sym: { fontSize: 16, fontWeight: '800' },
  symName: { fontSize: 11, marginTop: 2 },
  allocRight: { alignItems: 'flex-end' },
  allocVal: { fontSize: 15, fontWeight: '700' },
  allocCurPct: { fontSize: 12, marginTop: 2 },
  barsWrap: { marginBottom: 12 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative' },
  barTarget: { position: 'absolute', height: '100%', borderRadius: 4 },
  barCur: { height: '100%', borderRadius: 4 },
  allocBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  targetWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetLabel: { fontSize: 12 },
  targetInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, width: 64, fontSize: 14, textAlign: 'center' },
  actionChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontSize: 12, fontWeight: '700' },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
});
