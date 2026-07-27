import { create } from 'zustand';

/** Geometria (em coordenadas da janela) de onde a transição deve partir. */
export type RetanguloOrigem = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** borderRadius da forma na origem, p/ interpolar até 0 na tela cheia. */
  radius: number;
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
  setOrigem: (id, rect) => set(s => ({ origens: { ...s.origens, [id]: rect } })),
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
