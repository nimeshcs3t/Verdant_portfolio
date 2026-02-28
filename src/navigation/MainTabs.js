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

const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator();
const TxStack = createStackNavigator();
const JournalStack = createStackNavigator();

function DashStackNav() {
  const { C } = useApp();
  return (
    <DashStack.Navigator screenOptions={{ headerStyle: { backgroundColor: C.card }, headerTintColor: C.text, headerTitleStyle: { fontWeight: '700' } }}>
      <DashStack.Screen name="DashHome" component={DashboardScreen} options={{ headerShown: false }} />
      <DashStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </DashStack.Navigator>
  );
}

function TxStackNav() {
  const { C } = useApp();
  return (
    <TxStack.Navigator screenOptions={{ headerStyle: { backgroundColor: C.card }, headerTintColor: C.text, headerTitleStyle: { fontWeight: '700' } }}>
      <TxStack.Screen name="TxList" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <TxStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
    </TxStack.Navigator>
  );
}

function JournalStackNav() {
  const { C } = useApp();
  return (
    <JournalStack.Navigator screenOptions={{ headerStyle: { backgroundColor: C.card }, headerTintColor: C.text, headerTitleStyle: { fontWeight: '700' } }}>
      <JournalStack.Screen name="JournalList" component={JournalScreen} options={{ title: 'Journal' }} />
      <JournalStack.Screen name="JournalEntry" component={JournalEntryScreen} options={{ title: 'Entry' }} />
    </JournalStack.Navigator>
  );
}

export default function MainTabs() {
  const { C } = useApp();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: C.tabBar, borderTopColor: C.border, height: 62, paddingBottom: 8 },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = { Dashboard: 'home', Transactions: 'swap-horizontal', Allocation: 'pie-chart', Journal: 'book' };
          return <Ionicons name={focused ? icons[route.name] : icons[route.name] + '-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashStackNav} />
      <Tab.Screen name="Transactions" component={TxStackNav} options={{ tabBarLabel: 'Trades' }} />
      <Tab.Screen name="Allocation" component={AllocationScreen} />
      <Tab.Screen name="Journal" component={JournalStackNav} />
    </Tab.Navigator>
  );
}
