import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AllocationScreen from '../screens/AllocationScreen';
import JournalScreen from '../screens/JournalScreen';
import JournalEntryScreen from '../screens/JournalEntryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createStackNavigator();
const TransactionStack = createStackNavigator();
const JournalStack = createStackNavigator();

function DashboardStackNavigator() {
  const { theme } = useApp();
  const c = theme.colors;
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        cardStyle: { backgroundColor: c.background },
      }}
    >
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ headerShown: false }} />
      <DashboardStack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Asset Detail' }} />
      <DashboardStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </DashboardStack.Navigator>
  );
}

function TransactionStackNavigator() {
  const { theme } = useApp();
  const c = theme.colors;
  return (
    <TransactionStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        cardStyle: { backgroundColor: c.background },
      }}
    >
      <TransactionStack.Screen name="TransactionsList" component={TransactionsScreen} options={{ headerShown: false }} />
      <TransactionStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
    </TransactionStack.Navigator>
  );
}

function JournalStackNavigator() {
  const { theme } = useApp();
  const c = theme.colors;
  return (
    <JournalStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        cardStyle: { backgroundColor: c.background },
      }}
    >
      <JournalStack.Screen name="JournalList" component={JournalScreen} options={{ headerShown: false }} />
      <JournalStack.Screen name="JournalEntry" component={JournalEntryScreen} options={{ title: 'Journal Entry' }} />
    </JournalStack.Navigator>
  );
}

export default function MainTabNavigator() {
  const { theme } = useApp();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Trades: focused ? 'swap-horizontal' : 'swap-horizontal-outline',
            Allocation: focused ? 'pie-chart' : 'pie-chart-outline',
            Journal: focused ? 'journal' : 'journal-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardStackNavigator} />
      <Tab.Screen name="Trades" component={TransactionStackNavigator} />
      <Tab.Screen name="Allocation" component={AllocationScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Journal" component={JournalStackNavigator} />
    </Tab.Navigator>
  );
}
