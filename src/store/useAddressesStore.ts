import { create } from 'zustand';

import { SAVED_ADDRESSES, type SavedAddress } from '@data/addresses';

type AddressesState = {
  addresses: SavedAddress[];
  /** Endereço de entrega padrão. `''` quando não há nenhum salvo. */
  defaultId: string;
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (id: string, address: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
};

/**
 * Endereços de entrega. Mesma estrutura de `useCardsStore` (lista + "qual é o
 * padrão"), e pelo mesmo motivo: a lista (`/addresses`) e o formulário
 * (`/add-address`) são telas diferentes.
 *
 * `updateAddress` existe aqui e não em cartão porque endereço se EDITA — muda o
 * complemento, muda o recado da portaria — enquanto cartão só se cadastra e se
 * remove (número não se corrige, se troca).
 *
 * Não persistido, como os demais exceto `useUserStore`.
 */
export const useAddressesStore = create<AddressesState>(set => ({
  addresses: SAVED_ADDRESSES,
  defaultId: SAVED_ADDRESSES[0]?.id ?? '',

  addAddress: address =>
    set(s => {
      const saved: SavedAddress = { ...address, id: `addr-${Date.now()}` };
      return {
        addresses: [...s.addresses, saved],
        // Primeiro endereço da conta já vira o padrão — não faz sentido ter um
        // endereço salvo e nenhum de entrega.
        defaultId: s.defaultId || saved.id,
      };
    }),

  updateAddress: (id, address) =>
    set(s => ({
      addresses: s.addresses.map(a => (a.id === id ? { ...address, id } : a)),
    })),

  removeAddress: id =>
    set(s => {
      const addresses = s.addresses.filter(a => a.id !== id);
      return {
        addresses,
        defaultId: id === s.defaultId ? (addresses[0]?.id ?? '') : s.defaultId,
      };
    }),

  setDefault: id => set({ defaultId: id }),
}));
