import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import SearchScreen from './src/screens/SearchScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import DetailScreen from './src/screens/DetailScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ModelScreen from './src/screens/ModelScreen';
import NetworkAnalysisScreen from './src/screens/NetworkAnalysisScreen';

import { colors } from './src/theme';
import type { RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgSection,
    text: colors.text,
    border: colors.border,
    primary: colors.blue,
    notification: colors.blue,
  },
};

const headerStyle = {
  backgroundColor: colors.bgSection,
  borderBottomColor: colors.border,
};

// Minimal text tab icons matching the gov aesthetic
const TAB_ICONS: Record<string, string> = {
  Search: 'ΑΝΑΖ',
  Bookmarks: 'ΑΠΟΘ',
  History: 'ΙΣΤΟΡ',
  Settings: 'ΡΥΘ',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle,
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700' as const,
          fontSize: 15,
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: colors.bgSection,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.blueLight,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 0.5 },
        tabBarIcon: ({ color, focused }) => (
          <View style={{
            width: 28, height: 2, borderRadius: 1,
            backgroundColor: focused ? colors.blue : 'transparent',
            marginBottom: 3,
          }} />
        ),
      })}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerTitle: 'Εντοπισμός Επιρροών — Πολιτικό Αναλυτικό', tabBarLabel: 'Αναζήτηση' }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ headerTitle: 'Αποθηκευμένα Προφίλ', tabBarLabel: 'Αποθηκευμένα' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: 'Ιστορικό Αναζητήσεων', tabBarLabel: 'Ιστορικό' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: 'Ρυθμίσεις Συστήματος', tabBarLabel: 'Ρυθμίσεις' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle,
            headerTintColor: colors.text,
            headerTitleStyle: {
              color: colors.text,
              fontWeight: '700' as const,
              fontSize: 15,
            },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Αποτελέσματα Ανάλυσης' }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Προφίλ Επιρροής' }} />
          <Stack.Screen name="ModelManager" component={ModelScreen} options={{ title: 'Διαχείριση Μοντέλων' }} />
          <Stack.Screen name="NetworkAnalysis" component={NetworkAnalysisScreen} options={{ title: 'Ανάλυση Δικτύου' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
