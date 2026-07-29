import { type ReactNode } from 'react';

import {
  type ImageSourcePropType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { type BlurTint } from 'expo-blur';

export type ParallaxHeaderProps = {
  /** Fotografia do hero — `require()` de asset local ou `{ uri }`. */
  image: ImageSourcePropType;
  /** Altura da foto em repouso. Default `IMAGE_HEIGHT` (420). */
  imageHeight?: number;
  /**
   * Conteúdo desenhado SOBRE a foto, ancorado na base dela (eyebrow, título,
   * chamada). Rola na velocidade do conteúdo — não na da foto — e sai em fade
   * antes de passar por baixo da barra fixa.
   */
  overlay?: ReactNode;
  /** Título que entra na barra fixa quando a foto sai de vista. */
  compactTitle: string;
  /**
   * Ação à esquerda no topo — na prática, o voltar. Fica SEMPRE visível, fora da
   * barra que faz fade: sobre a foto o botão precisa existir desde o 1º frame.
   */
  leftComponent?: ReactNode;
  /** Idem, do outro lado (ex.: compartilhar, favoritar). */
  rightComponent?: ReactNode;
  children: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Véu sobre a foto (topo → base). Default `SCRIM_COLORS`. */
  scrimColors?: [string, string, string];
  scrimLocations?: [number, number, number];
  /** Gradiente que entra atrás da barra fixa ao rolar. */
  navGradientColors?: [string, string, string];
  /** Blur da barra fixa. `intensity` é o TETO — ele anima de 0 até aí. */
  navBlurConfig?: { intensity: number; tint: BlurTint };
  navTitleStyle?: StyleProp<TextStyle>;
};
