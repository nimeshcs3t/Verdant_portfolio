import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const FILTERS = ['ALL', 'BUY', 'SELL', 'DIVIDEND'];
const TYPE_COLORS = { BUY: '#3FB950', SELL: '#F85149', DIVIDEND: '#58A6FF' };

export default function TransactionsScreen({ navigation }) {
  const { C, transactions, deleteTransaction, isHidden } = useApp();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('ALL');

  const filtered = transactions.filter(t => filter === 'ALL' || t.type === filter);
  const fmt = (v) => isHidden ? '••••' : '$' + (+v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const confirmDelete = (id) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Filter tabs */}
      <View style={[s.filterRow, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterTab, filter === f && { borderBottomColor: C.primary }]} onPress={() => setFilter(f)}>
            <Text style={[s.filterText, { color: filter === f ? C.primary : C.muted }]}>{f}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[s.addBtn, { backgroundColor: C.primary }]} onPress={() => navigation.navigate('AddTransaction')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🧾</Text>
          <Text style={[s.emptyTitle, { color: C.text }]}>No transactions yet</Text>
          <Text style={[s.emptySub, { color: C.muted }]}>Tap + to add your first trade</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 14 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: tx }) => {
            const total = +tx.shares * +tx.price;
            const tColor = TYPE_COLORS[tx.type] || C.muted;
            return (
              <View style={[s.txCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={[s.txBadge, { backgroundColor: tColor + '20' }]}>
                  <Text style={[s.txBadgeText, { color: tColor }]}>{tx.type}</Text>
                </View>
                <View style={s.txInfo}>
                  <Text style={[s.txSym, { color: C.text }]}>{tx.symbol}</Text>
                  <Text style={[s.txDetail, { color: C.muted }]}>{tx.shares} × {fmt(tx.price)}</Text>
                  {tx.notes ? <Text style={[s.txNote, { color: C.muted }]}>📝 {tx.notes}</Text> : null}
                </View>
                <View style={s.txRight}>
                  <Text style={[s.txTotal, { color: C.text }]}>{fmt(total)}</Text>
                  <Text style={[s.txDate, { color: C.muted }]}>{tx.date}</Text>
                  <TouchableOpacity onPress={() => confirmDelete(tx.id)} style={{ marginTop: 6 }}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  filterRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 4 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterText: { fontSize: 12, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptySub: { fontSize: 13 },
  txCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, alignItems: 'flex-start' },
  txBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 12, alignSelf: 'flex-start' },
  txBadgeText: { fontSize: 11, fontWeight: '800' },
  txInfo: { flex: 1 },
  txSym: { fontSize: 15, fontWeight: '700' },
  txDetail: { fontSize: 12, marginTop: 3 },
  txNote: { fontSize: 11, marginTop: 5, fontStyle: 'italic' },
  txRight: { alignItems: 'flex-end' },
  txTotal: { fontSize: 14, fontWeight: '600' },
  txDate: { fontSize: 11, marginTop: 3 },
});
