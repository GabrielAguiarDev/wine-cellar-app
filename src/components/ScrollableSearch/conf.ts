import { alpha, palette } from '@theme/index';

import { HEADER_HEIGHT } from '../AnimatedHeaderScrollView/conf';

/**
 * Constantes do `ScrollableSearch`. Como no `AnimatedHeaderScrollView`, o
 * original (reacticx) traz uma paleta dark; aqui só as CORES mudaram para o
 * creme/bordô do IL DiVino. As medidas e intensidades são as do original,
 * exceto onde comentado.
 */

/** Overscroll (px) que dispara o foco. É o `pullThreshold` do original. */
export const PULL_THRESHOLD = 80;

/**
 * Altura da barra compacta do header, importada em vez de redigitada: é ela que
 * define onde a barra de busca desaparece ao rolar (ver `SearchBar`).
 */
export const COMPACT_HEADER_HEIGHT = HEADER_HEIGHT;

/**
 * Altura fixa do cartão da busca — e do `Anchor` que reserva o lugar dele no
 * conteúdo. Fixa de propósito: as duas medidas TÊM de bater, senão o conteúdo
 * salta quando a barra assume a posição medida.
 */
export const BAR_HEIGHT = 48;

/** Folga entre a status bar e a barra quando ela está focada no topo. */
export const FOCUSED_TOP_GAP = 6;

/**
 * Em quantos px de scroll a barra sai em fade ao encostar no header compacto.
 * No original o fade é fixo em [0, 100] porque lá a barra já nasce no topo;
 * aqui ela nasce no meio do conteúdo, e um fade fixo a deixaria invisível ainda
 * bem longe do header. Ver `SearchBar`.
 */
export const BAR_FADE_WINDOW = 30;

/** Teto do blur do overlay. */
export const MAX_BLUR_INTENSITY = 60;

/** Mola da subida/descida da barra entre o repouso e o topo focado. */
export const PULL_SPRING = {
  damping: 18,
  stiffness: 120,
  mass: 0.6,
} as const;

/**
 * O teclado só desce depois da animação de saída — descer junto corta o
 * movimento da barra pela metade.
 */
export const DISMISS_KEYBOARD_DELAY = 450;

export const spacing = {
  sm: 8,
  md: 16,
  /** Padding horizontal padrão das telas do app. */
  lg: 22,
} as const;

export const Colors = {
  surface: palette.cremeSurface,
  border: alpha.inkBorder14,
  icon: palette.mutedIcon,
  shadow: palette.wine,
  /** Fundo do overlay onde não há blur (Android < 31 e web). */
  scrim: 'rgba(243,236,221,0.96)',
} as const;

/** Mesma razão do `AnimatedHeaderScrollView`: no Android o blur é opt-in. */
export const ANDROID_BLUR_METHOD = 'dimezisBlurViewSdk31Plus' as const;
