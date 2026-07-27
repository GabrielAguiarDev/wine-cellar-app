import { create } from 'zustand';

/** Geometria (em coordenadas da janela) de onde a transição deve partir. */
export type RetanguloOrigem = {
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
  texto?: { x: number; y: number };
  /** Canto superior esquerdo do CTA do card — o único elemento sem par no destino. */
  botao?: { x: number; y: number };
};

type TransicaoState = {
  /** Origens medidas, indexadas pelo `transitionId` do shared element. */
  origens: Record<string, RetanguloOrigem>;
  setOrigem: (id: string, rect: RetanguloOrigem) => void;
  limparOrigem: (id: string) => void;
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
export const useTransicaoStore = create<TransicaoState>(set => ({
  origens: {},
  setOrigem: (id, rect) =>
    set(s => ({ origens: { ...s.origens, [id]: rect } })),
  limparOrigem: id =>
    set(s => {
      if (!s.origens[id]) {
        return s;
      }
      const origens = { ...s.origens };
      delete origens[id];
      return { origens };
    }),
}));
