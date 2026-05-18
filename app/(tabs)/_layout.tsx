import React from 'react';
import { Tabs } from 'expo-router';
import { LiquidGlassTabBar } from '@/components/navigation/LiquidGlassTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendario" />
      <Tabs.Screen name="lavori" />
      <Tabs.Screen name="impostazioni" />
    </Tabs>
  );
}
