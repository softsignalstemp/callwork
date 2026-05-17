import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_BAR_H = 72;
const TAB_BAR_SIDE_PADDING = 16;
const INNER_WIDTH = SCREEN_WIDTH - TAB_BAR_SIDE_PADDING * 2;
const TAB_COUNT = 4;
const TAB_W = INNER_WIDTH / TAB_COUNT;
const CAPSULE_W = TAB_W - 16;
const CAPSULE_H = 52;

type IconConf = {
  outline: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  filled: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
};

const TABS: IconConf[] = [
  { outline: 'home-outline', filled: 'home', label: 'Home' },
  { outline: 'calendar-month-outline', filled: 'calendar-month', label: 'Calendario' },
  { outline: 'briefcase-outline', filled: 'briefcase', label: 'Lavori' },
  { outline: 'cog-outline', filled: 'cog', label: 'Impostazioni' },
];

function TabItem({
  conf,
  focused,
  onPress,
  onLongPress,
}: {
  conf: IconConf;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = focused ? Colors.primary : Colors.textMuted;

  return (
    <TouchableOpacity
      onPress={() => {
        scale.value = withSpring(0.88, { damping: 10 }, () => {
          scale.value = withSpring(1, { damping: 14 });
        });
        onPress();
      }}
      onLongPress={onLongPress}
      style={styles.tabTouch}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabContent, animStyle]}>
        <MaterialCommunityIcons
          name={focused ? conf.filled : conf.outline}
          size={24}
          color={iconColor}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: focused ? Colors.primary : Colors.textMuted },
          ]}
        >
          {conf.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function LiquidGlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const capsuleX = useSharedValue(TAB_BAR_SIDE_PADDING + state.index * TAB_W + (TAB_W - CAPSULE_W) / 2);

  useEffect(() => {
    capsuleX.value = withSpring(TAB_BAR_SIDE_PADDING + state.index * TAB_W + (TAB_W - CAPSULE_W) / 2, {
      damping: 22,
      stiffness: 200,
      mass: 0.8,
    });
  }, [state.index]);

  const capsuleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: capsuleX.value }],
  }));

  const barH = TAB_BAR_H + insets.bottom;

  return (
    <View style={[styles.outer, { height: barH, paddingBottom: insets.bottom }]}>
      {/* Glass blur layer */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 70 : 0}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Fallback bg (Android + overlay) */}
      <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} />
      {/* Top hairline */}
      <View style={styles.topLine} />

      <View style={styles.inner}>
        {/* Sliding capsule */}
        <Animated.View style={[styles.capsule, capsuleStyle]} pointerEvents="none">
          <BlurView
            intensity={Platform.OS === 'ios' ? 30 : 0}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.capsuleFill]} />
          {/* Capsule top shine */}
          <View style={styles.capsuleShine} />
        </Animated.View>

        {/* Tab items */}
        {TABS.map((conf, i) => (
          <TabItem
            key={conf.label}
            conf={conf}
            focused={state.index === i}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: state.routes[i].key, canPreventDefault: true });
              if (!event.defaultPrevented) navigation.navigate(state.routes[i].name);
            }}
            onLongPress={() =>
              navigation.emit({ type: 'tabLongPress', target: state.routes[i].key })
            }
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  bgOverlay: {
    backgroundColor: Colors.surface + 'CC',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: TAB_BAR_SIDE_PADDING,
    alignItems: 'center',
  },
  tabTouch: {
    width: TAB_W,
    height: CAPSULE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  capsule: {
    position: 'absolute',
    width: CAPSULE_W,
    height: CAPSULE_H,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  capsuleFill: {
    backgroundColor: Colors.primary + '18',
  },
  capsuleShine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: Colors.primaryGlow,
    opacity: 0.5,
    borderRadius: 1,
  },
});
