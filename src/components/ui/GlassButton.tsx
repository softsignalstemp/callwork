import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface GlassButtonProps {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlassButton({
  children,
  onPress,
  style,
  glowColor = Colors.primary,
  intensity = 40,
}: GlassButtonProps) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.4);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 12 });
    glow.value = withSpring(0.8, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14 });
    glow.value = withSpring(0.4, { damping: 12 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[
        styles.wrapper,
        {
          shadowColor: glowColor,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 4 },
        },
        animStyle,
        style,
      ]}
    >
      {/* Blur layer */}
      <BlurView
        intensity={Platform.OS === 'ios' ? intensity : 0}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      {/* Glass tint overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.tint, { backgroundColor: glowColor + '28' }]}
      />
      {/* Top shine line */}
      <Animated.View style={styles.shine} />
      {/* Content */}
      {children}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    elevation: 8,
  },
  tint: {},
  shine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.15,
    borderRadius: 1,
  },
});
