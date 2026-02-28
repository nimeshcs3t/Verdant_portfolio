import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(''); setLoading(true);
    try { await signup(email.trim(), password, name.trim()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <Text style={s.logo}>📈</Text>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.sub}>Start tracking your portfolio</Text>
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TextInput style={s.input} placeholder="Your name" placeholderTextColor="#8B949E" value={name} onChangeText={setName} />
        <TextInput style={s.input} placeholder="Email" placeholderTextColor="#8B949E" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={s.input} placeholder="Password (min 6 chars)" placeholderTextColor="#8B949E" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={s.btn} onPress={handle} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.link} onPress={() => navigation.navigate('Login')}>
          <Text style={s.linkText}>Already have an account? <Text style={{ color: '#58A6FF' }}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1117' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#E6EDF3', textAlign: 'center', marginBottom: 6 },
  sub: { fontSize: 15, color: '#8B949E', textAlign: 'center', marginBottom: 36 },
  error: { backgroundColor: '#F8514920', color: '#F85149', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 14 },
  input: { backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D', borderRadius: 12, padding: 16, color: '#E6EDF3', fontSize: 15, marginBottom: 14 },
  btn: { backgroundColor: '#238636', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#8B949E', fontSize: 14 },
});
