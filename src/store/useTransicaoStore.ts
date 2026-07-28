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
  /**
   * Shared elements que saíram da tela de origem por um push SEM animação de
   * Stack (`animation: 'none'`), indexados pelo `transitionId`.
   *
   * Sem animação de Stack, a tela de origem também não tem animação de VOLTA:
   * ela reaparece de um frame para o outro, seca, enquanto o shared element
   * termina de encolher macio. Esta flag é o pedido de "reapareça em fade" que
   * o card deixa para a tela de origem consumir quando voltar ao foco (ver
   * `ReentradaEmFade`).
   */
  reentradas: Record<string, boolean>;
  pedirReentrada: (id: string) => void;
  limparReentrada: (id: string) => void;
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
  reentradas: {},
  pedirReentrada: id =>
    set(s => ({ reentradas: { ...s.reentradas, [id]: true } })),
  limparReentrada: id =>
    set(s => {
      if (!s.reentradas[id]) {
        return s;
      }
      const reentradas = { ...s.reentradas };
      delete reentradas[id];
      return { reentradas };
    }),
}));
