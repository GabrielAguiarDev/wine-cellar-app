import { alpha, palette } from '@theme/index';

/**
 * Constantes do `ParallaxHeaderScrollView`. Mesmo papel do `conf.ts` do
 * `AnimatedHeaderScrollView`: as MEDIDAS/intensidades vêm do original (reacticx),
 * as CORES são as da identidade IL DiVino — aqui no lado escuro da paleta,
 * porque este header é uma fotografia com véu bordô por cima.
 */

/** Altura da barra fixa de navegação, sem o inset do topo. Igual à do iOS. */
export const NAV_HEIGHT = 44;

/**
 * Altura da foto em repouso. É um compromisso: quanto mais alta, mais a
 * fotografia é RECORTADA na largura (`resizeMode="cover"` numa foto 16:9), e a
 * adega perde as prateleiras das laterais; quanto mais baixa, menos espaço sobra
 * para o título entre a barra de navegação e a base da foto.
 */
export const IMAGE_HEIGHT = 380;

/**
 * Fração do scroll que a foto acompanha. `0.5` = a foto sobe na metade da
 * velocidade do conteúdo, que é o parallax em si — o conteúdo desliza SOBRE ela.
 */
export const PARALLAX_FACTOR = 0.5;

/**
 * Janela do fade do conteúdo sobre a foto, em frações da altura dela. Começar em
 * 0 fazia o título sumir cedo demais, no meio da tela e sem motivo aparente;
 * assim ele só apaga na aproximação da barra fixa — e termina antes de o título
 * compacto entrar, para os dois nunca aparecerem juntos.
 */
export const OVERLAY_FADE_START = 0.25;
export const OVERLAY_FADE_END = 0.7;

/** Distância (px) em que a barra fixa entra, antes de a foto sair de vista. */
export const NAV_FADE_DISTANCE = 80;

/** Idem para o título compacto — entra depois do fundo, na metade do caminho. */
export const NAV_TITLE_FADE_DISTANCE = 40;

/** Intensidade do blur da barra fixa quando ela está inteira. */
export const MAX_BLUR_INTENSITY = 30;

export const spacing = {
  sm: 8,
  md: 16,
  /** Padding horizontal padrão das telas do app. */
  lg: 22,
} as const;

/**
 * Véu sobre a foto: transparente no topo, bordô profundo na base. É ele que
 * garante o contraste do título sobre a fotografia (que é clara e dourada) e que
 * costura a foto ao corpo escuro da tela, sem linha de corte.
 */
export const SCRIM_COLORS: [string, string, string] = [
  'rgba(28,5,9,0.35)',
  'rgba(44,10,16,0.55)',
  palette.wineDeep,
];

export const SCRIM_LOCATIONS: [number, number, number] = [0, 0.45, 1];

/**
 * Gradiente que entra atrás da barra fixa ao rolar (bordô profundo). A primeira
 * parada é OPACA de propósito: o gradiente ainda passa pela máscara eased (que
 * já o dissolve para baixo), então translúcido no topo o fade acabava dobrado e
 * o título compacto ficava sem chão — com a borda do card de baixo aparecendo
 * atrás dele.
 */
export const NAV_GRADIENT_COLORS: [string, string, string] = [
  palette.wineDeep,
  'rgba(44,10,16,0.9)',
  'transparent',
];

export const Colors = {
  navTitle: palette.creme,
  /** Fio dourado sob a foto — remate entre a fotografia e o corpo da tela. */
  hairline: alpha.goldA35,
} as const;

/**
 * O blur do `expo-blur` no Android é opt-in: sem `blurMethod` ele desenha só uma
 * view semitransparente. Mesma escolha do `AnimatedHeaderScrollView`.
 */
export const ANDROID_BLUR_METHOD = 'dimezisBlurViewSdk31Plus' as const;
