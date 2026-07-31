import { type IconName } from '@components/Icon';
import { alpha, palette } from '@theme/index';

import type { ToastType } from './Toast.types';

/**
 * PALETA DOS TOASTS.
 *
 * A regra é: **o balão é sempre o mesmo** — bordô profundo, texto creme, uma
 * borda de 1pt. Quem muda com o tipo é só o ACENTO (ícone, borda e rótulo da
 * ação). Sem isso cada toast vira um cartão de cor diferente (era o caso: verde
 * #10B981, vermelho #EF4444, azul #3B82F6 direto do Tailwind, nenhum deles da
 * marca) e o aviso passa a competir com a tela em vez de pousar sobre ela.
 *
 * Os acentos saem todos da paleta: dourado, o rosé e o espumante dos líquidos,
 * o creme, e o `sage` (único acréscimo — ver `palette.ts`, os semânticos
 * `success`/`error` do tema são escuros demais para ler sobre o bordô).
 */
export type ToastSkin = {
  background: string;
  border: string;
  /** Ícone, rótulo da ação e borda — a única coisa que varia por tipo. */
  accent: string;
  text: string;
  /** `null` no tipo padrão: recado neutro não precisa de glifo. */
  icon: IconName | null;
};

/** Acento a 40% — a borda é o mesmo tom do ícone, sem disputar com o texto. */
const edge = (rgb: string) => `rgba(${rgb},0.4)`;

const base = {
  background: palette.wineDeep,
  text: palette.creme,
} as const;

export const TOAST_SKINS: Record<ToastType, ToastSkin> = {
  default: {
    ...base,
    accent: palette.gold,
    border: alpha.goldA40,
    icon: null,
  },
  success: {
    ...base,
    accent: palette.sage,
    border: edge('143,174,140'),
    icon: 'check',
  },
  error: {
    ...base,
    accent: palette.pourRose,
    border: edge('208,124,121'),
    icon: 'close',
  },
  warning: {
    ...base,
    accent: palette.pourSparkling,
    border: edge('216,184,114'),
    icon: 'alert',
  },
  info: {
    ...base,
    accent: palette.creme,
    border: alpha.cremeA25,
    icon: 'info',
  },
};
