import { createTheme } from '@shopify/restyle';

import { alpha, palette } from './palette';

/**
 * Nomes das famílias de fonte registradas em app/_layout.tsx (expo-font).
 * Cormorant Garamond (serif) para títulos/nomes/preços/citações;
 * Jost (sans) para UI/labels/corpo.
 */
export const fonts = {
  serifRegular: 'CormorantGaramond_400Regular',
  serifMedium: 'CormorantGaramond_500Medium',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  serifBold: 'CormorantGaramond_700Bold',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMediumItalic: 'CormorantGaramond_500Medium_Italic',
  sansLight: 'Jost_300Light',
  sansRegular: 'Jost_400Regular',
  sansMedium: 'Jost_500Medium',
  sansSemiBold: 'Jost_600SemiBold',
} as const;

const colors = {
  transparent: 'transparent',
  white: palette.white,
  black: palette.black,

  // Fundos
  background: palette.creme,
  surface: palette.cremeSurface,
  backgroundOuter: palette.cremeOuter,
  toggleTrack: palette.cremeToggle,
  mapBackground: palette.cremeMap,

  // Marca (bordô)
  primary: palette.wine,
  primaryLight: palette.wineLight,
  primaryAlt: palette.wineAlt,
  primaryDeep: palette.wineDeep,
  primaryDeeper: palette.wineDeeper,
  videoBackdrop: palette.wineDark2,

  // Acento (dourado)
  accent: palette.gold,
  accentDark: palette.goldDark,

  // Texto
  textPrimary: palette.ink,
  textOnDark: palette.creme,
  mutedIcon: palette.mutedIcon,

  // Semânticos de status (derivados da marca; ajustar quando houver design específico)
  success: '#2F4A34',
  error: '#8A2A2A',

  // Tokens com transparência (endereçáveis como cor no restyle)
  ...alpha,
} as const;

const theme = createTheme({
  colors,
  spacing: {
    s0: 0,
    s2: 2,
    s4: 4,
    s6: 6,
    s8: 8,
    s10: 10,
    s12: 12,
    s14: 14,
    s16: 16,
    s18: 18,
    s20: 20,
    s22: 22, // padding horizontal padrão das telas
    s24: 24,
    s26: 26,
    s28: 28,
    s30: 30,
    s32: 32,
    s34: 34,
    s40: 40,
    s44: 44,
    s52: 52,
    s56: 56, // padding topo (área do notch)
    s60: 60,
    s78: 78,
    s108: 108, // rodapé com tab bar
  },
  borderRadii: {
    r0: 0,
    r5: 5,
    r6: 6,
    r8: 8,
    r9: 9,
    r11: 11,
    r12: 12,
    r13: 13,
    r14: 14,
    r16: 16,
    r18: 18,
    r20: 20,
    rFull: 9999,
  },
  textVariants: {
    defaults: {
      fontFamily: fonts.sansRegular,
      fontSize: 14,
      color: 'textPrimary',
    },
    // Serif (Cormorant Garamond)
    brand: {
      fontFamily: fonts.serifSemiBold,
      fontSize: 58,
      lineHeight: 54,
      color: 'textOnDark',
    },
    h1: {
      fontFamily: fonts.serifSemiBold,
      fontSize: 44,
      lineHeight: 46,
      color: 'primary',
    },
    h2: {
      fontFamily: fonts.serifSemiBold,
      fontSize: 34,
      color: 'primary',
    },
    sectionTitle: {
      fontFamily: fonts.serifSemiBold,
      fontSize: 25,
      color: 'primary',
    },
    wineName: {
      fontFamily: fonts.serifSemiBold,
      fontSize: 20,
      color: 'textPrimary',
    },
    wineNameSm: {
      fontFamily: fonts.serifSemiBold,
      fontSize: 16,
      color: 'textPrimary',
    },
    price: {
      fontFamily: fonts.serifRegular,
      fontSize: 15,
      color: 'primary',
    },
    quote: {
      fontFamily: fonts.serifItalic,
      fontSize: 20,
      lineHeight: 28,
      color: 'textPrimary',
    },
    // Sans (Jost)
    body: {
      fontFamily: fonts.sansRegular,
      fontSize: 14,
      color: 'textPrimary',
    },
    bodySm: {
      fontFamily: fonts.sansRegular,
      fontSize: 12,
      color: 'inkA60',
    },
    label: {
      fontFamily: fonts.sansMedium,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: 'textPrimary',
    },
    eyebrow: {
      fontFamily: fonts.sansRegular,
      fontSize: 9,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'accent',
    },
    button: {
      fontFamily: fonts.sansMedium,
      fontSize: 12,
      letterSpacing: 2.4,
      textTransform: 'uppercase',
      color: 'textOnDark',
    },
  },
});

export type Theme = typeof theme;
export default theme;
