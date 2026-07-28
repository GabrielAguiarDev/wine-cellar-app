import { create } from 'zustand';

/** Geometria (em coordenadas da janela) de onde a transição deve partir. */
export type SourceRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** borderRadius da forma na origem, p/ interpolar até 0 na tela cheia. */
  radius: number;
  /**
   * Canto superior esquerdo do BLOCO DE TEXTO do card (coordenadas de janela).
   * É a partir dele que o texto do destino morfa: em vez de dois textos em
   * crossfade (que o olho identifica como blocos diferentes), o destino move e
   * escala um único bloco desta posição até a posição final.
   */
  text?: { x: number; y: number };
  /** Canto superior esquerdo do CTA do card — o único elemento sem par no destino. */
  button?: { x: number; y: number };
};

type TransitionState = {
  /** Origens medidas, indexadas pelo `transitionId` do shared element. */
  sources: Record<string, SourceRect>;
  setSource: (id: string, rect: SourceRect) => void;
  clearSource: (id: string) => void;
  /**
   * Shared elements que saíram da tela de origem por um push SEM animação de
   * Stack (`animation: 'none'`), indexados pelo `transitionId`.
   *
   * Sem animação de Stack, a tela de origem também não tem animação de VOLTA:
   * ela reaparece de um frame para o outro, seca, enquanto o shared element
   * termina de encolher macio. Esta flag é o pedido de "reapareça em fade" que
   * o card deixa para a tela de origem consumir quando voltar ao foco (ver
   * `FadeReentry`).
   */
  reentries: Record<string, boolean>;
  requestReentry: (id: string) => void;
  clearReentry: (id: string) => void;
};

/**
 * Ponte entre os dois estados de um shared element: o estado de origem (ex.:
 * o card da curadoria na Home) mede a si mesmo antes de navegar e grava o
 * retângulo aqui; o estado de destino (tela cheia) lê esse retângulo e anima
 * a forma dali até ocupar a tela.
 *
 * Sem origem gravada (deep link, refresh), o destino simplesmente aparece já
 * em tela cheia, sem animação.
 */
export const useTransitionStore = create<TransitionState>(set => ({
  sources: {},
  setSource: (id, rect) => set(s => ({ sources: { ...s.sources, [id]: rect } })),
  clearSource: id =>
    set(s => {
      if (!s.sources[id]) {
        return s;
      }
      const sources = { ...s.sources };
      delete sources[id];
      return { sources };
    }),
  reentries: {},
  requestReentry: id =>
    set(s => ({ reentries: { ...s.reentries, [id]: true } })),
  clearReentry: id =>
    set(s => {
      if (!s.reentries[id]) {
        return s;
      }
      const reentries = { ...s.reentries };
      delete reentries[id];
      return { reentries };
    }),
}));
