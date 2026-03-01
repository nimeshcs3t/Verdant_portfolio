import 'react-native-gesture-handler'; // MUST be at the very top
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Your Providers
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// 1. Web-Specific CSS Fix: Prevents 0px height white screens
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    #root, body, html {
      height: 100% !important;
      width: 100% !important;
      margin: 0;
      padding: 0;
      display: flex;
    }
    #root > div {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.append(style);
}

export default function App() {
  
  useEffect(() => {
    console.log("APP INITIALIZED - API URL:", process.env.EXPO_PUBLIC_API_URL);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        {/* We wrap the providers in a simple try/catch logic via standard React if needed, 
            but for now, we ensure they have a flex:1 container */}
        <AuthProvider>
          <AppProvider>
            <NavigationContainer fallback={<View style={styles.loading}><Text>Loading Navigation...</Text></View>}>
              <RootNavigator />
            </NavigationContainer>
          </AppProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // On web, '100vh' ensures it takes the full browser height
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#000', // Matches your likely theme to avoid white flash
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  }
});
