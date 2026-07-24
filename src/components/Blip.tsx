import { useEffect } from 'react';

import { View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '@theme/index';

type BlipProps = {
  /** Tamanho do núcleo. O anel expande a partir dele. */
  size?: number;
  color?: string;
  /** Cor da borda do núcleo (ex.: creme, para o entregador no mapa). */
  ringBorderColor?: string;
  ringBorderWidth?: number;
};

/** Ponto com anel pulsante (efeito "ilblip" do design). */
export function Blip({
  size = 18,
  color = palette.gold,
  ringBorderColor,
  ringBorderWidth = 0,
}: BlipProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
     
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [progress]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + progress.value * 1.8 }],
    opacity: 1 - progress.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderColor: ringBorderColor,
          borderWidth: ringBorderWidth,
        }}
      />
    </View>
  );
}
