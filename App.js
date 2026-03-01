import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Your Providers
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// Web CSS Fix: Prevents the app from collapsing to 0px height
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
    }
  `;
  document.head.append(style);
}

export default function App() {
  useEffect(() => {
    console.log("🚀 App Started");
    console.log("🔗 API URL:", process.env.EXPO_PUBLIC_API_URL);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppProvider>
            <NavigationContainer>
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
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
    backgroundColor: '#000', // Change to your theme color
  },
});
