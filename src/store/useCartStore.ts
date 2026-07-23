import { create } from 'zustand';

type CartState = {
  items: Record<string, number>; // { [wineId]: qty }
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clear: () => void;
};

/** Carrinho (mock local; migra para react-query/Context na Fase 16). */
export const useCartStore = create<CartState>(set => ({
  items: {},
  addToCart: (id, qty = 1) =>
    set(s => ({ items: { ...s.items, [id]: (s.items[id] ?? 0) + qty } })),
  setQty: (id, delta) =>
    set(s => {
      const items = { ...s.items };
      const next = (items[id] ?? 1) + delta;
      if (next < 1) {
        delete items[id];
      } else {
        items[id] = next;
      }
      return { items };
    }),
  removeFromCart: id =>
    set(s => {
      const items = { ...s.items };
      delete items[id];
      return { items };
    }),
  clear: () => set({ items: {} }),
}));
