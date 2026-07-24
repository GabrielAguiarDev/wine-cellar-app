import { useEffect } from 'react';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '@theme/index';

type PulseBarProps = {
  height: number;
  delay?: number;
  duration?: number;
  color?: string;
};

/** Barra que pulsa de opacidade (equalizador do vídeo "reproduzindo"). */
export function PulseBar({
  height,
  delay = 0,
  duration = 900,
  color = palette.gold,
}: PulseBarProps) {
  const v = useSharedValue(0.35);

  useEffect(() => {
     
    v.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration }), -1, true),
    );
  }, [v, delay, duration]);

  const style = useAnimatedStyle(() => ({ opacity: v.value }));

  return (
    <Animated.View style={[{ width: 3, height, backgroundColor: color }, style]} />
  );
}
