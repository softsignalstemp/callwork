import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

interface LiquidGlassSegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}

const PADDING = 4;
const ITEM_HEIGHT = 42;
const SPRING = { damping: 22, stiffness: 240, mass: 0.8 };

export function LiquidGlassSegmented<T extends string>({
  options,
  value,
  onChange,
}: LiquidGlassSegmentedProps<T>) {
  const [containerW, setContainerW] = useState(0);
  const activeIndex = options.findIndex((o) => o.value === value);
  const capsuleX = useSharedValue(0);
  const capsuleW = containerW > 0 ? (containerW - PADDING * 2) / options.length : 0;

  useEffect(() => {
    if (capsuleW > 0) {
      capsuleX.value = withSpring(activeIndex * capsuleW, SPRING);
    }
  }, [activeIndex, capsuleW]);

  const capsuleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: capsuleX.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerW(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.outer} onLayout={onLayout}>
      {/* ── Glass container background ── */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 55 : 0}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.outerTint]} />
      {/* Top shine */}
      <View style={styles.outerShine} />

      <View style={styles.inner}>
        {/* ── Sliding capsule ── */}
        {capsuleW > 0 && (
          <Animated.View
            style={[styles.capsule, { width: capsuleW, height: ITEM_HEIGHT }, capsuleStyle]}
            pointerEvents="none"
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 30 : 0}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, styles.capsuleTint]} />
            {/* Capsule inner shine */}
            <View style={styles.capsuleShine} />
            {/* Capsule bottom reflection */}
            <View style={styles.capsuleReflect} />
          </Animated.View>
        )}

        {/* ── Option labels ── */}
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              style={[styles.tab, { height: ITEM_HEIGHT }]}
            >
              {opt.icon && (
                <MaterialCommunityIcons
                  name={active ? opt.icon : opt.icon}
                  size={15}
                  color={active ? Colors.primaryGlow : Colors.textMuted}
                  style={{ marginBottom: 1 }}
                />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? Colors.text : Colors.textMuted },
                  active && styles.tabLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    overflow: 'hidden',
    // Neon glow
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  outerTint: {
    backgroundColor: Colors.surface + 'BB',
  },
  outerShine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: Colors.primaryGlow,
    opacity: 0.35,
  },
  inner: {
    flexDirection: 'row',
    padding: PADDING,
    alignItems: 'center',
  },

  // Capsule
  capsule: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  capsuleTint: {
    backgroundColor: Colors.primary + '28',
  },
  capsuleShine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.2,
  },
  capsuleReflect: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: Colors.primaryGlow,
    opacity: 0.12,
  },

  // Tabs
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
