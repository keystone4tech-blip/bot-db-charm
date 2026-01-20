import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/app/HomeScreen';
import VPNScreen from '../screens/app/VPNScreen';
import ChannelsScreen from '../screens/app/ChannelsScreen';
import ReferralScreen from '../screens/app/ReferralScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import AdminScreen from '../screens/app/AdminScreen';
import { useAppSelector } from '../redux/hooks';
import { selectUser } from '../redux/slices/authSlice';

export type MainTabParamList = {
  Home: undefined;
  VPN: undefined;
  Channels: undefined;
  Referral: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'VPN') {
            iconName = focused ? 'key' : 'key-outline';
          } else if (route.name === 'Channels') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Referral') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Главная' }} />
      <Tab.Screen name="VPN" component={VPNScreen} options={{ tabBarLabel: 'VPN' }} />
      <Tab.Screen name="Channels" component={ChannelsScreen} options={{ tabBarLabel: 'Каналы' }} />
      <Tab.Screen name="Referral" component={ReferralScreen} options={{ tabBarLabel: 'Рефералы' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Профиль' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useAppSelector(selectUser);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {user && user.id && (
        <Stack.Screen name="Admin" component={AdminScreen} />
      )}
    </Stack.Navigator>
  );
}
