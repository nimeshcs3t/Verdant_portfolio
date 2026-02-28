import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { C, isDark, toggleDark, isHidden, toggleHidden, transactions } = useApp();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const Row = ({ icon, iconBg, label, right, onPress, danger }) => (
    <TouchableOpacity style={[s.row, { borderBottomColor: C.border }]} onPress={onPress} disabled={!onPress}>
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={[s.rowLabel, { color: danger ? C.red : C.text }]}>{label}</Text>
      <View style={s.rowRight}>{right}</View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[s.root, { backgroundColor: C.bg }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile card */}
      <View style={[s.profile, { backgroundColor: '#1C2128', borderColor: '#30363D' }]}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <View>
          <Text style={[s.profileName, { color: '#E6EDF3' }]}>{user?.name || 'Investor'}</Text>
          <Text style={[s.profileEmail, { color: '#8B949E' }]}>{user?.email}</Text>
        </View>
      </View>

      {/* Appearance */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>APPEARANCE</Text>
      <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
        <Row icon="moon" iconBg="#7C3AED" label="Dark Mode" right={<Switch value={isDark} onValueChange={toggleDark} trackColor={{ true: C.primary }} />} />
        <Row icon="eye-off" iconBg="#6B7280" label="Hide Values" right={<Switch value={isHidden} onValueChange={toggleHidden} trackColor={{ true: C.primary }} />} />
      </View>

      {/* Data */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>DATA</Text>
      <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
        <Row icon="stats-chart" iconBg="#238636" label={`${transactions.length} Transactions`} right={<Ionicons name="chevron-forward" size={16} color={C.muted} />} />
      </View>

      {/* Account */}
      <Text style={[s.sectionLabel, { color: C.muted }]}>ACCOUNT</Text>
      <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
        <Row icon="log-out" iconBg="#CF222E" label="Logout" onPress={confirmLogout} danger right={<Ionicons name="chevron-forward" size={16} color={C.red} />} />
      </View>

      <Text style={[s.version, { color: C.muted }]}>PortfolioTrack v1.0.0 · Built with Expo</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  profile: { margin: 16, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#58A6FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 20, marginBottom: 8, marginTop: 4 },
  section: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15 },
  rowRight: {},
  version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
