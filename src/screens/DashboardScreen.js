import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { fetchAllPrices } from '../services/priceService';

const fmt = (v, hidden) => hidden ? '••••••' : '$' + Math.abs(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (v, hidden) => hidden ? '••%' : (v >= 0 ? '+' : '') + (v || 0).toFixed(2) + '%';

export default function DashboardScreen({ navigation }) {
  const { C, isHidden, toggleHidden, getMetrics, setPrices, prices } = useApp();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const [priceLoading, setPriceLoading] = React.useState(false);

  const { holdings, totalValue, totalGainLoss, totalGainLossPct, todayGainLoss, todayGainLossPct } = getMetrics();

  const loadPrices = useCallback(async () => {
    if (holdings.length === 0) return;
    setPriceLoading(true);
    const p = await fetchAllPrices(holdings);
    setPrices(p);
    setPriceLoading(false);
  }, [holdings.length]);

  useEffect(() => { loadPrices(); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadPrices(); setRefreshing(false); };

  const gc = (v) => v >= 0 ? C.green : C.red;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: C.card, paddingTop: insets.top + 12, borderBottomColor: C.border }]}>
        <View>
          <Text style={[s.greeting, { color: C.muted }]}>Welcome back,</Text>
          <Text style={[s.username, { color: C.text }]}>{user?.name || 'Investor'} 👋</Text>
        </View>
        <View style={s.headerActions}>
          {priceLoading && <ActivityIndicator color={C.primary} style={{ marginRight: 8 }} />}
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.card2, borderColor: C.border }]} onPress={toggleHidden}>
            <Ionicons name={isHidden ? 'eye-off' : 'eye'} size={18} color={C.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.card2, borderColor: C.border, marginLeft: 8 }]} onPress={() => navigation.navigate('Dashboard', { screen: 'Settings' })}>
            <Ionicons name="settings-outline" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero card */}
        <View style={[s.hero, { backgroundColor: '#1C2128', borderColor: '#30363D' }]}>
          <Text style={[s.heroLabel, { color: '#8B949E' }]}>Total Portfolio Value</Text>
          <Text style={[s.heroValue, { color: '#E6EDF3' }]}>{fmt(totalValue, isHidden)}</Text>
          <View style={s.heroRow}>
            <View style={s.heroBlock}>
              <Text style={[s.heroBlockLabel, { color: '#8B949E' }]}>Total Gain/Loss</Text>
              <Text style={[s.heroBlockValue, { color: gc(totalGainLoss) }]}>{fmt(totalGainLoss, isHidden)}</Text>
              <Text style={[s.heroBlockPct, { color: gc(totalGainLoss) }]}>{fmtPct(totalGainLossPct, isHidden)}</Text>
            </View>
            <View style={[s.heroDivider, { backgroundColor: '#30363D' }]} />
            <View style={s.heroBlock}>
              <Text style={[s.heroBlockLabel, { color: '#8B949E' }]}>Today's Change</Text>
              <Text style={[s.heroBlockValue, { color: gc(todayGainLoss) }]}>{fmt(todayGainLoss, isHidden)}</Text>
              <Text style={[s.heroBlockPct, { color: gc(todayGainLoss) }]}>{fmtPct(todayGainLossPct, isHidden)}</Text>
            </View>
          </View>
        </View>

        {/* Holdings */}
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: C.text }]}>Holdings</Text>
            <Text style={[s.cardSub, { color: C.muted }]}>{holdings.length} assets</Text>
          </View>
          {holdings.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💼</Text>
              <Text style={[s.emptyTitle, { color: C.text }]}>No holdings yet</Text>
              <Text style={[s.emptySub, { color: C.muted }]}>Add your first transaction</Text>
              <TouchableOpacity style={[s.emptyBtn, { backgroundColor: C.primary }]} onPress={() => navigation.navigate('Transactions', { screen: 'AddTransaction' })}>
                <Text style={s.emptyBtnText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            holdings.map((h, i) => (
              <View key={h.symbol} style={[s.holdingRow, { borderBottomColor: C.border, borderBottomWidth: i < holdings.length - 1 ? 1 : 0 }]}>
                <View style={[s.badge, { backgroundColor: C.card2 }]}>
                  <Text style={[s.badgeText, { color: C.primary }]}>{h.symbol.slice(0, 2)}</Text>
                </View>
                <View style={s.holdingInfo}>
                  <Text style={[s.holdingSym, { color: C.text }]}>{h.symbol}</Text>
                  <Text style={[s.holdingName, { color: C.muted }]}>{h.name}</Text>
                </View>
                <View style={s.holdingRight}>
                  <Text style={[s.holdingVal, { color: C.text }]}>{fmt(h.currentValue, isHidden)}</Text>
                  <Text style={[s.holdingPct, { color: gc(h.gainLoss) }]}>{fmtPct(h.gainLossPct, isHidden)}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Allocation bars */}
        {holdings.length > 0 && (
          <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[s.cardTitle, { color: C.text, marginBottom: 14 }]}>Allocation</Text>
            {holdings.map(h => {
              const pct = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
              return (
                <View key={h.symbol} style={s.allocRow}>
                  <Text style={[s.allocSym, { color: C.text }]}>{h.symbol}</Text>
                  <View style={[s.allocBarBg, { backgroundColor: C.card2 }]}>
                    <View style={[s.allocBarFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: C.primary }]} />
                  </View>
                  <Text style={[s.allocPct, { color: C.muted }]}>{pct.toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  greeting: { fontSize: 12 },
  username: { fontSize: 18, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { margin: 16, borderRadius: 18, padding: 22, borderWidth: 1 },
  heroLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  heroValue: { fontSize: 36, fontWeight: '800', letterSpacing: -1, marginBottom: 20 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroBlock: { flex: 1 },
  heroDivider: { width: 1, height: 40, marginHorizontal: 16 },
  heroBlockLabel: { fontSize: 11, marginBottom: 4 },
  heroBlockValue: { fontSize: 16, fontWeight: '700' },
  heroBlockPct: { fontSize: 12, marginTop: 2 },
  card: { marginHorizontal: 16, marginBottom: 14, borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12 },
  empty: { alignItems: 'center', padding: 28 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptySub: { fontSize: 13, marginBottom: 18 },
  emptyBtn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  holdingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  badge: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  badgeText: { fontSize: 13, fontWeight: '800' },
  holdingInfo: { flex: 1 },
  holdingSym: { fontSize: 15, fontWeight: '700' },
  holdingName: { fontSize: 12, marginTop: 2 },
  holdingRight: { alignItems: 'flex-end' },
  holdingVal: { fontSize: 14, fontWeight: '600' },
  holdingPct: { fontSize: 12, marginTop: 2 },
  allocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  allocSym: { width: 50, fontSize: 12, fontWeight: '700' },
  allocBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  allocBarFill: { height: '100%', borderRadius: 4 },
  allocPct: { width: 40, fontSize: 11, textAlign: 'right' },
});
