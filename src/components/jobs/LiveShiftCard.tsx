import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { formatEuro, formatOre } from '@/utils/formatters';
import { hapticNotification } from '@/utils/haptics';
import type { Sessione, Datore } from '@/db/types';

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function timeToH(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

function useNow(intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

interface LiveShiftCardProps {
  sessioni: Sessione[];
  datori: Datore[];
}

export function LiveShiftCard({ sessioni, datori }: LiveShiftCardProps) {
  const now = useNow(30000);
  const todayStr = today();

  const liveSession = useMemo(() => {
    const nowH = now.getHours() + now.getMinutes() / 60;
    return sessioni.find((s) => {
      if (s.data !== todayStr) return false;
      const start = timeToH(s.oraInizio);
      const end = timeToH(s.oraFine);
      return nowH >= start && nowH < end;
    });
  }, [sessioni, now, todayStr]);

  const prevRef = useRef<Sessione | undefined>(undefined);
  const [displaySession, setDisplaySession] = useState<Sessione | undefined>(liveSession);
  const opacity = useSharedValue(liveSession ? 1 : 0);
  const scaleY = useSharedValue(liveSession ? 1 : 0);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = liveSession;

    if (prev && !liveSession) {
      hapticNotification();
      opacity.value = withTiming(0, { duration: 350 });
      scaleY.value = withTiming(0, { duration: 380 });
      const timer = setTimeout(() => setDisplaySession(undefined), 400);
      return () => clearTimeout(timer);
    }

    if (!prev && liveSession) {
      setDisplaySession(liveSession);
      opacity.value = withSpring(1, { damping: 16, stiffness: 180 });
      scaleY.value = withSpring(1, { damping: 16, stiffness: 180 });
    }

    if (liveSession) {
      setDisplaySession(liveSession);
    }
  }, [liveSession]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scaleY: scaleY.value }],
    transformOrigin: 'top',
    overflow: 'hidden',
  }));

  if (!displaySession) return null;

  const datore = datori.find((d) => d.id === displaySession.datoreId);
  const accentColor = datore?.colore ?? Colors.available;

  const nowH = now.getHours() + now.getMinutes() / 60;
  const start = timeToH(displaySession.oraInizio);
  const oreFinora = Math.max(0, nowH - start);
  const guadagnoFinora = oreFinora * (displaySession.guadagno / displaySession.oreTotali);

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <View style={[styles.card, { borderColor: accentColor + '55', shadowColor: accentColor }]}>
        <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
        <View style={styles.content}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="clock-fast" size={14} color={accentColor} />
            <Text style={[styles.label, { color: accentColor }]}>Turno in corso</Text>
            <Text style={styles.datore} numberOfLines={1}>{datore?.nome ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.time}>{displaySession.oraInizio} → {displaySession.oraFine}</Text>
            <View style={styles.spacer} />
            <Text style={[styles.earnings, { color: accentColor }]}>
              {formatEuro(guadagnoFinora)} · {formatOre(oreFinora)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  datore: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  spacer: { flex: 1 },
  earnings: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
