import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';

import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@hooks/useAppTheme';

import { Box } from '../Box';
import {
  type FlipCardContextValue,
  type FlipCardFaceProps,
  type FlipCardProps,
  type FlipCardTriggerProps,
} from './types';

/** Mesma dupla do `PressableScale`: encolhe seco, volta com mola. */
const PRESS_IN_DURATION = 100;
const PRESS_SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

/**
 * Sombra só no iOS — no Android a `elevation` de uma view que gira em `rotateY`
 * é desenhada a partir da caixa NÃO girada, então ela fica parada enquanto o
 * cartão vira. Sem sombra a virada é limpa; com ela, tem uma mancha estática por
 * baixo. (O original faz o mesmo recorte por plataforma.)
 */
const SHADOW: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      }
    : {};

const FlipCardContext = createContext<FlipCardContextValue | null>(null);

const useFlipCard = () => {
  const ctx = useContext(FlipCardContext);
  if (!ctx) {
    throw new Error('FlipCard.* precisa estar dentro de <FlipCard>');
  }
  return ctx;
};

/**
 * Cartão que vira em 3D — porte do
 * [flip-card do reacticx](https://www.reacticx.com/docs/components/flip-card),
 * compound como o original (`FlipCard` / `.Front` / `.Back` / `.Trigger`).
 *
 * ── O que mudou no porte ────────────────────────────────────────────────────
 *
 * 1. **Modo controlado** (`flipped`). No original a virada só nasce do toque no
 *    `Trigger`; aqui ela também pode ser dirigida de fora — é o que liga a face
 *    de trás ao FOCO do campo do CVV em `/payment-methods`. As duas faces são
 *    animadas por um único efeito que observa `isFlipped`, então controlado e
 *    não-controlado percorrem exatamente o mesmo caminho.
 * 2. **Sem `@sbaiahmed1/react-native-blur`.** O original desfoca a face durante
 *    a virada (borrão de movimento) com uma lib nativa de terceiros que não está
 *    no projeto — e o efeito dura ~200ms no meio de uma rotação que já esconde a
 *    face. `expo-blur` (que o projeto tem) não expõe `blurAmount` por face.
 * 3. **Sem háptico** (`expo-haptics` é módulo nativo fora do projeto — exigiria
 *    rebuild do dev client). O afundar ao toque continua.
 * 4. **Cor e raio em tokens** do tema, não hex cru (`#1a1a1a` no original).
 *
 * A troca de face é por OPACIDADE em 90°, além do `backfaceVisibility` — no
 * Android o backface sozinho não é confiável e as duas faces aparecem juntas na
 * metade da virada. Ambos, como no original.
 */
export function FlipCard({
  children,
  width,
  height,
  borderRadius = 'r18',
  duration = 600,
  flipped,
  onFlip,
  shadow = true,
  scaleOnPress = true,
}: FlipCardProps) {
  const { borderRadii } = useAppTheme();
  const [internalFlipped, setInternalFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const isControlled = flipped !== undefined;
  const isFlipped = isControlled ? flipped : internalFlipped;

  /*
    `.set()`/`.get()` em vez de `.value` em TODO o componente: com o shared value
    viajando por contexto e por dependência de hook, a atribuição em `.value` é
    barrada pelo `react-hooks/immutability`. É a convenção já anotada em
    DEVELOPMENT.md §7.
  */
  useEffect(() => {
    rotation.set(
      withTiming(isFlipped ? 180 : 0, {
        duration,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
  }, [isFlipped, duration, rotation]);

  const flip = useCallback(() => {
    const next = !isFlipped;
    if (!isControlled) {
      setInternalFlipped(next);
    }
    onFlip?.(next);
  }, [isFlipped, isControlled, onFlip]);

  const ctx = useMemo<FlipCardContextValue>(
    () => ({
      isFlipped,
      flip,
      width,
      height,
      borderRadius: borderRadii[borderRadius],
      shadow,
      scaleOnPress,
      rotation,
      scale,
    }),
    [
      isFlipped,
      flip,
      width,
      height,
      borderRadii,
      borderRadius,
      shadow,
      scaleOnPress,
      rotation,
      scale,
    ],
  );

  return (
    <FlipCardContext.Provider value={ctx}>
      <Box
        width={width}
        height={height}
        alignItems="center"
        justifyContent="center">
        {children}
      </Box>
    </FlipCardContext.Provider>
  );
}

/** `front` gira 0→180; `back` nasce virada e vai de 180→360. */
function useFaceStyle(face: 'front' | 'back') {
  const { rotation, scale } = useFlipCard();

  return useAnimatedStyle(() => {
    const angle = rotation.get();

    const rotateY =
      face === 'front'
        ? interpolate(angle, [0, 180], [0, 180], Extrapolation.CLAMP)
        : interpolate(angle, [0, 180], [180, 360], Extrapolation.CLAMP);

    const opacity =
      face === 'front'
        ? interpolate(
            angle,
            [0, 90, 90.01, 180],
            [1, 1, 0, 0],
            Extrapolation.CLAMP,
          )
        : interpolate(
            angle,
            [0, 89.99, 90, 180],
            [0, 0, 1, 1],
            Extrapolation.CLAMP,
          );

    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scale.get() },
      ],
      opacity,
    };
  });
}

function Face({
  face,
  children,
  backgroundColor,
  style,
}: FlipCardFaceProps & { face: 'front' | 'back' }) {
  const { width, height, borderRadius, shadow, isFlipped } = useFlipCard();
  const { colors } = useAppTheme();
  const animatedStyle = useFaceStyle(face);

  const hidden = face === 'front' ? isFlipped : !isFlipped;

  /*
    DUAS camadas de propósito. `overflow: 'hidden'` liga o `masksToBounds` da
    layer no iOS, e a máscara recorta também a SOMBRA — quem põe os dois no
    mesmo nó (o original põe) fica sem sombra nenhuma. Então: a de fora carrega
    transform, opacidade e sombra; a de dentro, o raio e o recorte do conteúdo
    (o gradiente tem de terminar no canto arredondado).
  */
  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'auto'}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      style={[
        {
          position: 'absolute',
          width,
          height,
          borderRadius,
          backfaceVisibility: 'hidden',
        },
        shadow && SHADOW,
        animatedStyle,
      ]}>
      <View
        style={[
          {
            flex: 1,
            borderRadius,
            overflow: 'hidden',
            backgroundColor: backgroundColor
              ? colors[backgroundColor]
              : 'transparent',
          },
          style,
        ]}>
        {children}
      </View>
    </Animated.View>
  );
}

function FlipCardFront(props: FlipCardFaceProps) {
  return <Face face="front" {...props} />;
}

function FlipCardBack(props: FlipCardFaceProps) {
  return <Face face="back" {...props} />;
}

function FlipCardTrigger({
  children,
  asChild = false,
  accessibilityLabel = 'Virar o cartão',
}: FlipCardTriggerProps) {
  const { flip, scale, scaleOnPress, isFlipped } = useFlipCard();

  const onPressIn = useCallback(() => {
    if (!scaleOnPress) {
      return;
    }
    scale.set(withTiming(0.96, { duration: PRESS_IN_DURATION }));
  }, [scaleOnPress, scale]);

  const onPressOut = useCallback(() => {
    if (!scaleOnPress) {
      return;
    }
    scale.set(withSpring(1, PRESS_SPRING));
  }, [scaleOnPress, scale]);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onPress: flip,
      onPressIn,
      onPressOut,
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ expanded: isFlipped }}
      onPress={flip}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={StyleSheet.absoluteFill}>
      {children}
    </Pressable>
  );
}

FlipCard.Front = FlipCardFront;
FlipCard.Back = FlipCardBack;
FlipCard.Trigger = FlipCardTrigger;
