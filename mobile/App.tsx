import React from 'react';
import { Text } from 'react-native';
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

import { colors } from './src/theme';
import type { RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgCard,
    text: colors.text,
    border: colors.border,
    primary: colors.gold,
    notification: colors.gold,
  },
};

const headerStyle = {
  backgroundColor: colors.bgCard,
  borderBottomColor: colors.border,
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.gold, fontWeight: '700' as const, fontSize: 16 },
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          height: 58,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' as const },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, string> = {
            Search: '🔍',
            Bookmarks: '⭐',
            History: '📜',
            Settings: '⚙️',
          };
          return <Text style={{ fontSize: focused ? 22 : 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerTitle: 'Political Influencer Intelligence', tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ headerTitle: 'Saved Influencers', tabBarLabel: 'Saved' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: 'Search History', tabBarLabel: 'History' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: 'Configuration', tabBarLabel: 'Settings' }}
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
            headerTitleStyle: { color: colors.gold, fontWeight: '700' as const },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Analysis Results' }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Influencer Profile' }} />
          <Stack.Screen name="ModelManager" component={ModelScreen} options={{ title: 'Local Models' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
