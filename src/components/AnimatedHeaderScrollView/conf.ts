import { alpha, palette } from '@theme/index';

/**
 * Constantes do `AnimatedHeaderScrollView`. No original (reacticx) este arquivo
 * carrega uma paleta dark; aqui ele carrega a identidade IL DiVino — creme e
 * bordô. Só as CORES mudaram; as medidas e as intensidades são as do original.
 */

/** Altura da barra compacta, sem o inset do topo. Mesma da nav bar do iOS. */
export const HEADER_HEIGHT = 44;

/** Intensidade do blur do fundo do header no fim do colapso. */
export const MAX_BLUR_INTENSITY = 40;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  /** Padding horizontal padrão das telas do app. */
  lg: 22,
  xl: 32,
} as const;

export const Colors = {
  titulo: palette.wine,
  subtitulo: alpha.inkA55,
  /** Fio de separação sob a barra compacta. */
  fio: alpha.inkBorder14,
} as const;

/**
 * O blur do `expo-blur` no Android é opt-in: sem `blurMethod` ele desenha só uma
 * view semitransparente. `dimezisBlurViewSdk31Plus` cai de volta para isso em
 * Android < 31, onde o custo não se paga.
 */
export const ANDROID_BLUR_METHOD = 'dimezisBlurViewSdk31Plus' as const;
