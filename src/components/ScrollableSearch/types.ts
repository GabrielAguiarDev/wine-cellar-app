import { type ReactNode, type RefObject } from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import { type BlurTint } from 'expo-blur';
import {
  type SharedValue,
  type WithSpringConfig,
} from 'react-native-reanimated';

/**
 * Nomes: o original expõe `IScrollableSearch`, `IScrollContent`,
 * `IAnimatedComponent`, `IOverlay`… Aqui seguem a convenção do app
 * (`XxxProps`), e `AnimatedComponent` virou `SearchBar` — é o que ele é.
 */

export type ScrollableSearchContextValue = {
  /** A busca está aberta (barra no topo, overlay visível, teclado aberto). */
  isFocused: boolean;
  /** Abre/fecha a busca. Ao fechar, o teclado desce com atraso (ver `conf`). */
  setIsFocused: (focused: boolean) => void;
  /** Offset do scroll da tela, espelhado por quem tem o ScrollView. */
  scrollY: SharedValue<number>;
  /** Overscroll em px, sempre positivo. Zero quando a lista não está esticada. */
  pullDistance: SharedValue<number>;
  /** Callback registrado pela `SearchBar`, disparado ao passar do limiar. */
  onPullToFocusRef: RefObject<(() => void) | null>;
  /**
   * Muda a cada mudança de tamanho do conteúdo. O `Anchor` remede quando isso
   * acontece — ver o comentário dele: a primeira medição pode pegar o layout
   * ainda incompleto.
   */
  contentVersion: number;
  /** Quem tem o ScrollView chama no `onContentSizeChange` dele. */
  notifyContentResize: () => void;
  /**
   * WORKLET. Quem tem o ScrollView chama a cada frame, com o offset vertical:
   * é isso que alimenta `scrollY`/`pullDistance` e dispara o foco.
   */
  onScroll: (offsetY: number) => void;
  /**
   * WORKLET. Início do arrasto, com o offset do momento: é aqui que se decide se
   * este gesto é uma PUXADA (começou no topo) ou uma rolagem comum. Ver o
   * comentário do `onScroll` no componente.
   */
  onBeginDrag: (offsetY: number) => void;
  /** WORKLET. Fim do arrasto: rearma o disparo para o gesto seguinte. */
  onEndDrag: () => void;
};

export type ScrollableSearchProps = {
  children: ReactNode;
  /** Overscroll (px) que dispara o foco. Default `PULL_THRESHOLD` (80). */
  pullThreshold?: number;
};

export type ScrollableSearchAnchorProps = {
  /**
   * Recebe o Y do ancoradouro NA TELA (px, já compensando o scroll atual). É o
   * `anchorY` que a `SearchBar` usa como posição de repouso.
   */
  onMeasure: (anchorY: number) => void;
  /** Altura reservada. Default `BAR_HEIGHT` — mude junto com a da barra. */
  height?: number;
};

export type SearchBarProps = {
  /** Conteúdo da barra: ícone, `TextInput`, botão de limpar… */
  children: ReactNode;
  /**
   * Y de repouso da barra na tela, vindo do `Anchor`. Enquanto for 0 (não
   * medido) a barra fica invisível, para não piscar no topo no primeiro frame.
   */
  anchorY: number;
  /** Disparado quando o overscroll passa do limiar. Normalmente abre a busca. */
  onPullToFocus?: () => void;
  /** Escala + sombra crescendo com o overscroll. Default `true`. */
  enablePullEffect?: boolean;
  springConfig?: WithSpringConfig;
  /** Estilo do cartão da barra (fundo, borda, raio já vêm aplicados). */
  style?: StyleProp<ViewStyle>;
};

export type ScrollableSearchOverlayProps = {
  children?: ReactNode;
  /** Toque no overlay (fora do conteúdo). Costuma fechar a busca. */
  onPress?: () => void;
  enableBlur?: boolean;
  blurTint?: BlurTint;
  maxBlurIntensity?: number;
};

export type ScrollableSearchFocusedScreenProps = {
  children: ReactNode;
  /**
   * Espaço reservado no topo para a barra focada. Default: status bar + barra +
   * folga, calculado pelo componente — as telas não precisam saber a conta.
   */
  contentPaddingTop?: number;
};
