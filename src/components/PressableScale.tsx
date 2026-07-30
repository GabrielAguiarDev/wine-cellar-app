import { type ReactNode } from 'react';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PressableBox, type PressableBoxProps } from './Box';

const AnimatedPressableBox = Animated.createAnimatedComponent(PressableBox);

/**
 * Encolher é rápido e sem mola — o dedo já está lá, qualquer atraso lê como
 * lag. Voltar é com mola, porque é aí que o toque ganha peso físico.
 */
const PRESS_IN_DURATION = 90;
const SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

type PressableScaleProps = PressableBoxProps & {
  /**
   * Escala no toque. 0.96 é o padrão porque some em botão pequeno e ainda
   * aparece em card grande. Abaixo de ~0.9 o elemento "pula" em vez de afundar.
   */
  scaleTo?: number;
  /** Opacidade no toque. `1` (padrão) deixa só a escala contar a história. */
  opacityTo?: number;
  disabled?: boolean;
  children?: ReactNode;
};

/**
 * Pressable que afunda ao toque.
 *
 * Existe porque `TouchableOpacityBox` só apaga o elemento, e apagar não é a
 * mesma sensação de apertar: sem mudança de tamanho o toque não tem corpo. Use
 * onde o alvo é uma peça física — botão, card, tile. Onde o alvo é texto ou
 * ícone solto num header, opacidade continua sendo o certo.
 *
 * Aceita todas as props de tema do `Box`, então layout, cor e borda continuam
 * vindo dos tokens.
 */
export function PressableScale({
  scaleTo = 0.96,
  opacityTo = 1,
  disabled,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 - pressed.value * (1 - scaleTo) },
    ],
    opacity: 1 - pressed.value * (1 - opacityTo),
  }));

  return (
    <AnimatedPressableBox
      accessibilityRole="button"
      {...rest}
      disabled={disabled}
      onPressIn={event => {
        pressed.value = withTiming(1, { duration: PRESS_IN_DURATION });
        onPressIn?.(event);
      }}
      onPressOut={event => {
        pressed.value = withSpring(0, SPRING);
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}>
      {children}
    </AnimatedPressableBox>
  );
}
