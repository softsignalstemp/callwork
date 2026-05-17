import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ name, nameFocused, color, focused }: {
  name: IconName; nameFocused: IconName; color: string; focused: boolean;
}) {
  return (
    <View style={styles.iconWrapper}>
      <MaterialCommunityIcons
        name={focused ? nameFocused : name}
        size={26}
        color={focused ? Colors.primary : Colors.textMuted}
      />
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom + 4, height: 64 + insets.bottom }],
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surface }]} />
            <View style={styles.topBorder} />
          </View>
        ),
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home-outline" nameFocused="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="calendar-month-outline" nameFocused="calendar-month" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="lavori"
        options={{
          title: 'Lavori',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="briefcase-outline" nameFocused="briefcase" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="impostazioni"
        options={{
          title: 'Impostazioni',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cog-outline" nameFocused="cog" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  tabItem: {
    paddingTop: 10,
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
