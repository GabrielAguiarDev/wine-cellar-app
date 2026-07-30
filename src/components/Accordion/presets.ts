import { type AccordionAppearance } from './types';

/**
 * Presets de cor do acordeão — equivalente aos `AccordionThemes` do reacticx,
 * mas em tokens do tema.
 *
 * `light` é a caixa de conteúdo das telas creme (mesma dupla
 * `surface`/`inkBorder09` dos cards de "Como ganhar pontos"), com o indicador em
 * dourado escuro para não competir com o texto bordô do gatilho.
 *
 * `dark` NÃO é a inversão do claro: sobre bordô um `surface` creme viraria um
 * bloco branco no meio da tela escura, então a caixa é um véu creme translúcido
 * com borda dourada — o mesmo tratamento dos cards do card VIP.
 */
export const ACCORDION_APPEARANCE: Record<
  'light' | 'dark',
  AccordionAppearance
> = {
  light: {
    backgroundColor: 'surface',
    borderColor: 'inkBorder09',
    iconColor: 'accentDark',
  },
  dark: {
    backgroundColor: 'cremeA06',
    borderColor: 'goldA28',
    iconColor: 'accent',
  },
};
