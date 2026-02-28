import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';

const MOODS = ['🚀', '😊', '😐', '😟', '😰'];
const TAGS = ['Analysis', 'Idea', 'Review', 'Watchlist', 'Learning', 'Strategy', 'Mistake', 'Win'];

export default function JournalEntryScreen({ route, navigation }) {
  const { C, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();
  const existing = route.params?.entry;

  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [mood, setMood] = useState(existing?.mood || null);
  const [tags, setTags] = useState(existing?.tags || []);
  const [symbols, setSymbols] = useState(existing?.symbols?.join(', ') || '');
  const [market, setMarket] = useState(existing?.marketCondition || '');

  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const save = () => {
    if (!content.trim()) return Alert.alert('Error', 'Please write something!');
    const data = {
      title: title || `Entry — ${new Date().toLocaleDateString()}`,
      content: content.trim(), mood, tags,
      symbols: symbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
      marketCondition: market,
    };
    if (existing) { updateJournalEntry(existing.id, data); }
    else { addJournalEntry(data); }
    navigation.goBack();
  };

  const remove = () => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteJournalEntry(existing.id); navigation.goBack(); } },
    ]);
  };

  const inp = [s.input, { backgroundColor: C.card2, borderColor: C.border, color: C.text }];

  return (
    <ScrollView style={[s.root, { backgroundColor: C.bg }]} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Title */}
      <TextInput
        style={[s.titleInput, { color: C.text, borderBottomColor: C.border }]}
        placeholder="Entry title..."
        placeholderTextColor={C.muted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Mood */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>MOOD</Text>
      <View style={s.moodRow}>
        {MOODS.map(m => (
          <TouchableOpacity
            key={m}
            style={[s.moodBtn, { backgroundColor: mood === m ? C.primary + '30' : C.card2, borderColor: mood === m ? C.primary : C.border }]}
            onPress={() => setMood(mood === m ? null : m)}
          >
            <Text style={s.moodEmoji}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>YOUR THOUGHTS</Text>
      <TextInput
        style={[inp, s.contentInput]}
        placeholder="Market analysis, investment thesis, lessons learned..."
        placeholderTextColor={C.muted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      {/* Symbols */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>RELATED SYMBOLS</Text>
      <TextInput style={inp} placeholder="AAPL, BTC, VOO..." placeholderTextColor={C.muted} value={symbols} onChangeText={setSymbols} autoCapitalize="characters" />

      {/* Market */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>MARKET CONDITION</Text>
      <TextInput style={inp} placeholder="Bullish, Bearish, Sideways..." placeholderTextColor={C.muted} value={market} onChangeText={setMarket} />

      {/* Tags */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>TAGS</Text>
      <View style={s.tagsWrap}>
        {TAGS.map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tagBtn, { backgroundColor: tags.includes(t) ? C.primary + '20' : C.card2, borderColor: tags.includes(t) ? C.primary : C.border }]}
            onPress={() => toggleTag(t)}
          >
            <Text style={[s.tagBtnText, { color: tags.includes(t) ? C.primary : C.muted }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity style={[s.saveBtn, { backgroundColor: '#238636' }]} onPress={save}>
        <Text style={s.saveBtnText}>✓ {existing ? 'Update Entry' : 'Save Entry'}</Text>
      </TouchableOpacity>

      {/* Delete */}
      {existing && (
        <TouchableOpacity style={[s.deleteBtn, { borderColor: C.red }]} onPress={remove}>
          <Text style={[s.deleteBtnText, { color: C.red }]}>🗑 Delete Entry</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  titleInput: { fontSize: 22, fontWeight: '700', borderBottomWidth: 1, paddingVertical: 10, marginBottom: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  moodRow: { flexDirection: 'row', gap: 10 },
  moodBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  moodEmoji: { fontSize: 24 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 4 },
  contentInput: { height: 160, textAlignVertical: 'top', paddingTop: 14 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  tagBtnText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn: { borderWidth: 1, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 10 },
  deleteBtnText: { fontSize: 14, fontWeight: '600' },
});
