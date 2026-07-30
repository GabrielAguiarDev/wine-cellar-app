import { type CardBrand } from '@utils/card';

/**
 * Cartões salvos — mock da tela `/payment-methods`.
 *
 * Só o que uma lista de cartões pode guardar de verdade: bandeira, últimos 4,
 * titular e validade. Número completo e CVV NUNCA existem depois do cadastro
 * (nem em mock — mock virá cópia de estrutura na Fase 16, e um campo `number`
 * aqui viraria um campo `number` no store).
 */
export type SavedCard = {
  id: string;
  brand: CardBrand;
  last4: string;
  holder: string;
  /** MM/AA. */
  expiry: string;
};

export const SAVED_CARDS: SavedCard[] = [
  {
    id: 'card-1',
    brand: 'visa',
    last4: '4821',
    holder: 'Helena Prado',
    expiry: '09/28',
  },
  {
    id: 'card-2',
    brand: 'mastercard',
    last4: '2043',
    holder: 'Helena Prado',
    expiry: '03/27',
  },
];
