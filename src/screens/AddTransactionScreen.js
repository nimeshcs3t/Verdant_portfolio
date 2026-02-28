import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useApp } from '../context/AppContext';
import { fetchPrice, searchSymbols } from '../services/priceService';

const TYPES = ['BUY', 'SELL', 'DIVIDEND'];
const ASSET_TYPES = ['STOCK', 'ETF', 'CRYPTO', 'OTHER'];
const TYPE_COLOR = { BUY: '#3FB950', SELL: '#F85149', DIVIDEND: '#58A6FF' };

// Demo symbols for quick search
const DEMO = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'STOCK' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'STOCK' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'STOCK' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'STOCK' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'STOCK' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ ETF', type: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock ETF', type: 'ETF' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'ETF' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO' },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO' },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO' },
  { symbol: 'BNB', name: 'BNB', type: 'CRYPTO' },
  { symbol: 'XRP', name: 'XRP', type: 'CRYPTO' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'CRYPTO' },
];

export default function AddTransactionScreen({ navigation }) {
  const { C, addTransaction } = useApp();
  const [txType, setTxType] = useState('BUY');
  const [assetType, setAssetType] = useState('STOCK');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [fee, setFee] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [targetAlloc, setTargetAlloc] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState('');

  let searchTimer = null;
  const onSymbolChange = (val) => {
    setSymbol(val.toUpperCase());
    clearTimeout(searchTimer);
    if (val.length < 1) { setSearchResults([]); return; }
    const q = val.toUpperCase();
    const local = DEMO.filter(d => d.symbol.includes(q) || d.name.toUpperCase().includes(q)).slice(0, 6);
    setSearchResults(local);
  };

  const selectSymbol = async (item) => {
    setSymbol(item.symbol);
    setName(item.name);
    setAssetType(item.type);
    setSearchResults([]);
    setPriceLoading(true);
    const p = await fetchPrice(item.symbol, item.type);
    if (p?.price) setPrice(p.price.toString());
    setPriceLoading(false);
  };

  const total = ((+shares || 0) * (+price || 0) + (+fee || 0)).toFixed(2);

  const save = () => {
    setError('');
    if (!symbol) return setError('Enter a symbol');
    if (!shares || +shares <= 0) return setError('Enter number of shares');
    if (!price || +price <= 0) return setError('Enter a price');
    addTransaction({ type: txType, assetType, symbol, name: name || symbol, shares: +shares, price: +price, fee: +fee || 0, date, notes, targetAllocation: +targetAlloc || 0 });
    navigation.goBack();
  };

  const Row = ({ label, children }) => (
    <View style={s.fieldGroup}>
      <Text style={[s.label, { color: C.muted }]}>{label}</Text>
      {children}
    </View>
  );

  const inp = [s.input, { backgroundColor: C.card2, borderColor: C.border, color: C.text }];

  return (
    <ScrollView style={[s.root, { backgroundColor: C.bg }]} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {error ? <Text style={s.error}>{error}</Text> : null}

      {/* Transaction type */}
      <Row label="TYPE">
        <View style={s.segRow}>
          {TYPES.map(t => (
            <TouchableOpacity key={t} style={[s.seg, { borderColor: txType === t ? TYPE_COLOR[t] : C.border, backgroundColor: txType === t ? TYPE_COLOR[t] + '20' : C.card2 }]} onPress={() => setTxType(t)}>
              <Text style={[s.segText, { color: txType === t ? TYPE_COLOR[t] : C.muted }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Row>

      {/* Asset type */}
      <Row label="ASSET TYPE">
        <View style={s.segRow}>
          {ASSET_TYPES.map(t => (
            <TouchableOpacity key={t} style={[s.seg, { borderColor: assetType === t ? C.primary : C.border, backgroundColor: assetType === t ? C.primary + '20' : C.card2 }]} onPress={() => setAssetType(t)}>
              <Text style={[s.segText, { color: assetType === t ? C.primary : C.muted }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Row>

      {/* Symbol */}
      <Row label="SYMBOL">
        <TextInput style={inp} placeholder="Search: AAPL, BTC, VOO..." placeholderTextColor={C.muted} value={symbol} onChangeText={onSymbolChange} autoCapitalize="characters" />
        {searchResults.length > 0 && (
          <View style={[s.dropdown, { backgroundColor: C.card, borderColor: C.border }]}>
            {searchResults.map(r => (
              <TouchableOpacity key={r.symbol} style={[s.dropdownItem, { borderBottomColor: C.border }]} onPress={() => selectSymbol(r)}>
                <Text style={[s.dropSym, { color: C.primary }]}>{r.symbol}</Text>
                <Text style={[s.dropName, { color: C.muted }]}>{r.name}</Text>
                <Text style={[s.dropType, { color: C.muted }]}>{r.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Row>

      {/* Name */}
      <Row label="ASSET NAME">
        <TextInput style={inp} placeholder="e.g. Apple Inc." placeholderTextColor={C.muted} value={name} onChangeText={setName} />
      </Row>

      {/* Shares & Price */}
      <View style={s.twoCol}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Row label="SHARES / UNITS">
            <TextInput style={inp} placeholder="0" placeholderTextColor={C.muted} value={shares} onChangeText={setShares} keyboardType="decimal-pad" />
          </Row>
        </View>
        <View style={{ flex: 1 }}>
          <Row label={priceLoading ? 'PRICE (loading...)' : 'PRICE PER UNIT ($)'}>
            {priceLoading
              ? <View style={[inp, { justifyContent: 'center', height: 48 }]}><ActivityIndicator color={C.primary} /></View>
              : <TextInput style={inp} placeholder="0.00" placeholderTextColor={C.muted} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            }
          </Row>
        </View>
      </View>

      {/* Fee & Date */}
      <View style={s.twoCol}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Row label="FEE ($)">
            <TextInput style={inp} placeholder="0" placeholderTextColor={C.muted} value={fee} onChangeText={setFee} keyboardType="decimal-pad" />
          </Row>
        </View>
        <View style={{ flex: 1 }}>
          <Row label="DATE">
            <TextInput style={inp} placeholder="YYYY-MM-DD" placeholderTextColor={C.muted} value={date} onChangeText={setDate} />
          </Row>
        </View>
      </View>

      {/* Target allocation */}
      <Row label="TARGET ALLOCATION % (optional)">
        <TextInput style={inp} placeholder="e.g. 25 for 25%" placeholderTextColor={C.muted} value={targetAlloc} onChangeText={setTargetAlloc} keyboardType="decimal-pad" />
      </Row>

      {/* Notes */}
      <Row label="NOTES (optional)">
        <TextInput style={[inp, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]} placeholder="Why did you make this trade?" placeholderTextColor={C.muted} value={notes} onChangeText={setNotes} multiline />
      </Row>

      {/* Total */}
      <View style={[s.totalBox, { backgroundColor: C.card2, borderColor: C.border }]}>
        <Text style={[s.totalLabel, { color: C.muted }]}>Total Value</Text>
        <Text style={[s.totalVal, { color: C.text }]}>${total}</Text>
      </View>

      <TouchableOpacity style={[s.saveBtn, { backgroundColor: '#238636' }]} onPress={save}>
        <Text style={s.saveBtnText}>✓ Add Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  error: { backgroundColor: '#F8514920', color: '#F85149', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, height: 48 },
  segRow: { flexDirection: 'row', gap: 8 },
  seg: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  segText: { fontSize: 11, fontWeight: '700' },
  dropdown: { borderWidth: 1, borderRadius: 12, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  dropSym: { width: 60, fontWeight: '800', fontSize: 14 },
  dropName: { flex: 1, fontSize: 12 },
  dropType: { fontSize: 11 },
  twoCol: { flexDirection: 'row' },
  totalBox: { borderWidth: 1, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 14 },
  totalVal: { fontSize: 24, fontWeight: '800' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
