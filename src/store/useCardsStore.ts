import { create } from 'zustand';

import { SAVED_CARDS, type SavedCard } from '@data/paymentMethods';

type CardsState = {
  cards: SavedCard[];
  /** Cartão principal. `''` quando não há nenhum salvo. */
  primaryId: string;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (id: string) => void;
  setPrimary: (id: string) => void;
};

/**
 * Cartões salvos.
 *
 * Existe porque o cadastro virou TELA (`/add-card`) e não mais um formulário
 * dentro de `/payment-methods`: com o estado em `useState` da lista, o cartão
 * novo morreria no `router.back()`. Passar por parâmetro de rota seria serializar
 * um objeto de domínio na URL só para atravessar uma tela.
 *
 * Não é persistido — só `useUserStore` é. Ao reabrir o app volta o mock de dois
 * cartões, como o resto do estado de demonstração.
 *
 * O `id` é gerado AQUI, e não em quem chama, para a tela do formulário não ter de
 * inventar identidade (na Fase 16 quem devolve o id é o backend, e só este
 * arquivo muda).
 */
export const useCardsStore = create<CardsState>(set => ({
  cards: SAVED_CARDS,
  primaryId: SAVED_CARDS[0]?.id ?? '',

  addCard: card =>
    set(s => {
      const saved: SavedCard = { ...card, id: `card-${Date.now()}` };
      return {
        cards: [...s.cards, saved],
        // Primeiro cartão da conta já entra como principal — não faz sentido ter
        // um cartão salvo e nenhum principal.
        primaryId: s.primaryId || saved.id,
      };
    }),

  removeCard: id =>
    set(s => {
      const cards = s.cards.filter(c => c.id !== id);
      return {
        cards,
        primaryId: id === s.primaryId ? (cards[0]?.id ?? '') : s.primaryId,
      };
    }),

  setPrimary: id => set({ primaryId: id }),
}));
