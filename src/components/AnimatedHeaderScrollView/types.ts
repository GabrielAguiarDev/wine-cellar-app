import { type ReactNode } from 'react';

import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { type BlurTint } from 'expo-blur';

/** Gradiente do fundo do header. Três paradas, como no original. */
export type GradientConfig = {
  colors: [string, string, string];
  locations?: [number, number, number] | null;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

export type AnimatedHeaderProps = {
  /** Título: grande no topo da tela, compacto na barra fixa ao rolar. */
  largeTitle: string;
  /** Linha de apoio sob o título. Aparece nos dois estados. */
  subtitle?: string;
  children: ReactNode;
  /**
   * Nó no lugar do TEXTO do título grande — ex.: um logo (ver `Logo`).
   * `largeTitle` continua obrigatório e passa a ser só o rótulo de
   * acessibilidade. Com slot, o crescimento no overscroll vira `scale` (não dá
   * para animar o `fontSize` de um nó arbitrário).
   */
  largeTitleSlot?: ReactNode;
  /** Idem para a barra compacta. Costuma ser a versão reduzida do `largeTitleSlot`. */
  smallTitleSlot?: ReactNode;
  /**
   * Ação à direita no topo (ex.: favoritos, filtro). Fica SEMPRE visível, não
   * entra em fade com a barra — é como a nav bar do iOS se comporta: os botões
   * ficam, só o título compacto aparece ao rolar.
   */
  rightComponent?: ReactNode;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Gradiente que entra atrás do header ao rolar. */
  headerBackgroundGradient?: GradientConfig;
  /** Blur do fundo do header. `intensity` é o TETO — ele anima de 0 até aí. */
  headerBlurConfig?: { intensity: number; tint: BlurTint };
  /** Teto do blur que passa sobre o título compacto durante o colapso. */
  smallTitleBlurIntensity?: number;
  smallTitleBlurTint?: BlurTint;
  /** Paradas do gradiente que MASCARA o header (dá a borda inferior difusa). */
  maskGradientColors?: { start: string; middle: string; end: string };
  /** Precisa conter `fontSize`: é dele que sai o crescimento no overscroll. */
  largeHeaderTitleStyle?: TextStyle;
  largeHeaderSubtitleStyle?: StyleProp<TextStyle>;
  smallHeaderTitleStyle?: StyleProp<TextStyle>;
  smallHeaderSubtitleStyle?: StyleProp<TextStyle>;
  /**
   * Puxar a lista para baixo (overscroll) faz o título grande crescer até 2×.
   * É o comportamento do original; desligar quando o título for um logo, onde
   * esticar a marca não é aceitável. Default `true`.
   */
  growOnOverscroll?: boolean;
};
