import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SwipeableDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
}

const THRESHOLD = -80;

export function SwipeableDelete({ children, onDelete }: SwipeableDeleteProps) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 200])
    .failOffsetY([-12, 12])
    .onChange((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd(() => {
      if (translateX.value < THRESHOLD) {
        translateX.value = withSpring(-800, { damping: 20, stiffness: 120 });
        runOnJS(onDelete)();
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.bg}>
        <MaterialCommunityIcons name="delete" size={30} color="white" />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View style={animStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
});
