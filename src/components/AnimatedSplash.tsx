import { StyleSheet, type ViewStyle } from 'react-native';

import LottieView from 'lottie-react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { palette } from '@theme/index';

// Velocidade de reprodução do Lottie (o arquivo tem ~5,4s @ 60fps;
// ~1.8x deixa a intro em ~3s). Duração do fade out ao final.
const LOTTIE_SPEED = 1.8;
const FADE_OUT_MS = 450;

type AnimatedSplashProps = {
  /** Chamado após o fade out terminar (para desmontar o overlay). */
  onFinish: () => void;
};

/**
 * Splash animada: cobre o app inteiro com o fundo bordô (igual ao splash
 * nativo, para um handoff sem flash), toca o Lottie uma vez e faz fade out
 * ao terminar. Sem texto nem logo — apenas a animação.
 */
export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handleAnimationFinish = () => {
    // Mutar `.value` é a API padrão do Reanimated (a regra de imutabilidade
    // do react-hooks não a reconhece).
    // eslint-disable-next-line react-hooks/immutability
    opacity.value = withTiming(0, { duration: FADE_OUT_MS }, finished => {
      if (finished) {
        runOnJS(onFinish)();
      }
    });
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="none">
      <LottieView
        source={require('../../assets/lottie/wine.json')}
        autoPlay
        loop={false}
        speed={LOTTIE_SPEED}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        onAnimationFinish={handleAnimationFinish}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.wine,
    zIndex: 100,
    elevation: 100,
  } as ViewStyle,
});
