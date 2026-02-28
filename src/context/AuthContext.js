import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('pt_user').then(v => {
      if (v) setUser(JSON.parse(v));
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    if (!email || !password || password.length < 6)
      throw new Error('Enter a valid email and password (min 6 characters)');
    const u = { email, name: email.split('@')[0] };
    await AsyncStorage.setItem('pt_user', JSON.stringify(u));
    setUser(u);
  };

  const signup = async (email, password, name) => {
    if (!email || !password || password.length < 6)
      throw new Error('Enter a valid email and password (min 6 characters)');
    const u = { email, name: name || email.split('@')[0] };
    await AsyncStorage.setItem('pt_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('pt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
