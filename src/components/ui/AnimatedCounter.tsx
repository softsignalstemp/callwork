import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native-paper';
import type { TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  format: (n: number) => string;
  style?: TextStyle;
  variant?: React.ComponentProps<typeof Text>['variant'];
}

export function AnimatedCounter({ value, format, style, variant = 'displaySmall' }: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const duration = 800;

  useEffect(() => {
    startRef.current = displayed;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(startRef.current + (value - startRef.current) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return (
    <Text variant={variant} style={style}>
      {format(displayed)}
    </Text>
  );
}
