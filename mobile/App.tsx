import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen    from './src/screens/HomeScreen';
import SearchScreen  from './src/screens/SearchScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import DetailScreen  from './src/screens/DetailScreen';
import { RootStackParamList } from './src/types';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.navy,
    card:        colors.navyMid,
    text:        colors.white,
    border:      colors.navyLite,
    primary:     colors.gold,
    notification:colors.gold,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={NavTheme}>
      <StatusBar style="light" backgroundColor={colors.navy} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle:          { backgroundColor: colors.navyMid },
          headerTintColor:      colors.white,
          headerTitleStyle:     { fontWeight: '700', fontSize: 16 },
          headerBackTitleVisible: false,
          contentStyle:         { backgroundColor: colors.navy },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search Parameters',
            headerRight: () => null,
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Ranked Influencers' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'Intelligence Brief' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
