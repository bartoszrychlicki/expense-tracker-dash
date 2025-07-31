/**
 * Tabs Layout
 * 
 * Provides bottom tab navigation between Dashboard and Goals screens
 */

import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Cele',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="target" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 