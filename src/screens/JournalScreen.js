import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const TAGS = ['Analysis', 'Idea', 'Review', 'Watchlist', 'Learning', 'Strategy', 'Mistake', 'Win'];

export default function JournalScreen({ navigation }) {
  const { C, journal } = useApp();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState(null);

  const filtered = journal.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.content?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !tagFilter || e.tags?.includes(tagFilter);
    return matchSearch && matchTag;
  });

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Search */}
      <View style={[s.searchWrap, { backgroundColor: C.card, borderBottomColor: C.border }]}>
        <View style={[s.searchBox, { backgroundColor: C.card2, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={16} color={C.muted} />
          <TextInput style={[s.searchInput, { color: C.text }]} placeholder="Search entries..." placeholderTextColor={C.muted} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: C.primary }]} onPress={() => navigation.navigate('JournalEntry', { entry: null })}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tag filter */}
      <FlatList
        data={[null, ...TAGS]}
        keyExtractor={i => i || 'all'}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.tagRow, { borderBottomColor: C.border }]}
        renderItem={({ item: tag }) => (
          <TouchableOpacity
            style={[s.tagBtn, { backgroundColor: tagFilter === tag ? C.primary : C.card2, borderColor: tagFilter === tag ? C.primary : C.border }]}
            onPress={() => setTagFilter(tagFilter === tag ? null : tag)}
          >
            <Text style={[s.tagBtnText, { color: tagFilter === tag ? '#fff' : C.muted }]}>{tag || 'All'}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Entries */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📓</Text>
          <Text style={[s.emptyTitle, { color: C.text }]}>{journal.length === 0 ? 'Journal is empty' : 'No matches'}</Text>
          <Text style={[s.emptySub, { color: C.muted }]}>{journal.length === 0 ? 'Tap + to write your first entry' : 'Try a different search'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={e => e.id}
          contentContainerStyle={{ padding: 14 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: e }) => (
            <TouchableOpacity style={[s.card, { backgroundColor: C.card, borderColor: C.border }]} onPress={() => navigation.navigate('JournalEntry', { entry: e })}>
              <View style={s.cardTop}>
                <View style={s.cardTopLeft}>
                  {e.mood ? <Text style={s.mood}>{e.mood}</Text> : null}
                  <Text style={[s.dateText, { color: C.muted }]}>{new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                </View>
                {e.symbols?.length > 0 && (
                  <View style={s.symRow}>
                    {e.symbols.slice(0, 3).map(sym => (
                      <View key={sym} style={[s.symChip, { backgroundColor: C.primary + '20' }]}>
                        <Text style={[s.symChipText, { color: C.primary }]}>{sym}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <Text style={[s.entryTitle, { color: C.text }]}>{e.title || 'Untitled'}</Text>
              <Text style={[s.entryPreview, { color: C.muted }]} numberOfLines={2}>{e.content}</Text>
              {e.tags?.length > 0 && (
                <View style={s.tagsList}>
                  {e.tags.slice(0, 3).map(t => (
                    <View key={t} style={[s.tagChip, { backgroundColor: C.card2 }]}>
                      <Text style={[s.tagChipText, { color: C.muted }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, height: 38, gap: 6 },
  searchInput: { flex: 1, fontSize: 14 },
  addBtn: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tagRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  tagBtn: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },
  tagBtnText: { fontSize: 12, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptySub: { fontSize: 13 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mood: { fontSize: 18 },
  dateText: { fontSize: 11 },
  symRow: { flexDirection: 'row', gap: 4 },
  symChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  symChipText: { fontSize: 11, fontWeight: '700' },
  entryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  entryPreview: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  tagsList: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tagChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  tagChipText: { fontSize: 11 },
});
