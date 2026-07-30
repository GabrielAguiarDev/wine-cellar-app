import { type ReactNode } from 'react';

import { type Theme } from '@theme/theme';

/**
 * Cores do acordeão em TOKENS do tema (o original do reacticx recebe hex
 * crus num objeto `theme`). A regra do projeto é cor sempre semântica — e é o
 * que deixa o mesmo componente servir a tela creme e a tela bordô sem
 * reescrever nada. Presets em `presets.ts`.
 */
export type AccordionAppearance = {
  backgroundColor: keyof Theme['colors'];
  borderColor: keyof Theme['colors'];
  /** Cor do indicador (chevron/plus). */
  iconColor: keyof Theme['colors'];
};

/** `single` fecha o item aberto ao abrir outro; `multiple` acumula. */
export type AccordionType = 'single' | 'multiple';

/**
 * `chevron` gira 180° ao abrir. `plus` vira a barra vertical em 90°, virando um
 * "−" — é o idioma de FAQ. (O `cross` do original é um hambúrguer de 3 barras
 * que colapsa numa só; não se lê como abrir/fechar.)
 */
export type AccordionIndicator = 'chevron' | 'plus';

export type AccordionProps = {
  children: ReactNode;
  type?: AccordionType;
  appearance?: AccordionAppearance;
  /** Distância entre itens, em px. `0` (default) → itens divididos por linha. */
  spacing?: number;
  /** Item aberto no primeiro render. */
  defaultValue?: string;
};

export type AccordionItemProps = {
  children: ReactNode;
  /** Identidade do item dentro do acordeão. */
  value: string;
  indicator?: AccordionIndicator;
  /** Cresce um tico ao abrir, dando peso ao item ativo. Default `false`. */
  pop?: boolean;
  popScale?: number;
  /** @internal Injetado pelo `Accordion` — não passar à mão. */
  isLast?: boolean;
};

export type AccordionTriggerProps = {
  children: ReactNode;
  /** Default: o texto do `children`, quando ele é string. */
  accessibilityLabel?: string;
};

export type AccordionContentProps = {
  children: ReactNode;
};

export type AccordionContextValue = {
  openItems: Set<string>;
  toggle: (value: string) => void;
  appearance: AccordionAppearance;
  spacing: number;
};

export type AccordionItemContextValue = {
  value: string;
  isOpen: boolean;
  indicator: AccordionIndicator;
};
