import { type ReactNode } from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import { type SharedValue } from 'react-native-reanimated';

import { type Theme } from '@theme/theme';

export type FlipCardProps = {
  children: ReactNode;
  width: number;
  height: number;
  borderRadius?: keyof Theme['borderRadii'];
  /** Duração da virada, em ms. Default `600` (o do original). */
  duration?: number;
  /**
   * CONTROLADO: com esta prop definida, quem decide a face é quem chama — o
   * `Trigger` passa a só avisar (`onFlip`) em vez de virar por conta própria.
   * É o que permite ligar a virada a outra coisa que não o toque (no cadastro de
   * cartão, o foco no campo do CVV).
   *
   * Omitida → o componente guarda o estado sozinho, como no original.
   */
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  /** Sombra sob o cartão. Default `true`. */
  shadow?: boolean;
  /** Afundar ao toque no `Trigger`. Default `true`. */
  scaleOnPress?: boolean;
};

export type FlipCardFaceProps = {
  children: ReactNode;
  /** Fundo da face. Omitir quando o preenchimento vem de dentro (gradiente). */
  backgroundColor?: keyof Theme['colors'];
  style?: StyleProp<ViewStyle>;
};

export type FlipCardTriggerProps = {
  children?: ReactNode;
  /**
   * Entrega `onPress`/`onPressIn`/`onPressOut` ao filho em vez de embrulhá-lo
   * num `Pressable` que cobre o cartão inteiro. Use quando o alvo é um botão
   * dentro da face — sem isso o `Trigger` fica por cima e engole os toques dela.
   */
  asChild?: boolean;
  accessibilityLabel?: string;
};

export type FlipCardContextValue = {
  isFlipped: boolean;
  flip: () => void;
  width: number;
  height: number;
  borderRadius: number;
  shadow: boolean;
  scaleOnPress: boolean;
  rotation: SharedValue<number>;
  scale: SharedValue<number>;
};
