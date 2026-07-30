/**
 * Pedidos: data, rótulo de mês, título e status.
 *
 * Lógica pura e **sem `Date`** — de propósito. A data do pedido é uma string
 * `AAAA-MM-DD` e tudo que a UI precisa dela (dia, mês por extenso, ordenação) sai
 * de fatiar essa string. Passar por `new Date('2026-07-12')` traria o fuso junto:
 * em UTC-3 a data vira 11/07 às 21h e o pedido do dia 12 aparece listado no dia
 * 11. Além disso, função com `Date` não é testável sem congelar o relógio.
 */

const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const MONTHS_LONG = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/** Índice 0-based do mês, ou `null` se a data não for `AAAA-MM-DD`. */
const monthIndex = (isoDate: string): number | null => {
  const month = Number(isoDate.slice(5, 7));
  return month >= 1 && month <= 12 ? month - 1 : null;
};

/** "2026-07-12" → "12 jul". É a forma curta, de lista. */
export function formatOrderDate(isoDate: string): string {
  const index = monthIndex(isoDate);
  if (index === null) {
    return isoDate;
  }
  // `Number` para tirar o zero à esquerda: "05 jul" vira "5 jul".
  return `${Number(isoDate.slice(8, 10))} ${MONTHS_SHORT[index]}`;
}

/** Chave de agrupamento por mês: "2026-07". Ordena como texto. */
export const orderMonthKey = (isoDate: string) => isoDate.slice(0, 7);

/** "2026-07" → "Julho de 2026". Cabeçalho de cada bloco do histórico. */
export function orderMonthLabel(monthKey: string): string {
  const index = monthIndex(`${monthKey}-01`);
  return index === null
    ? monthKey
    : `${MONTHS_LONG[index]} de ${monthKey.slice(0, 4)}`;
}

/**
 * Título do pedido a partir dos nomes dos vinhos: o primeiro por extenso e o
 * resto contado ("Notte Eterna + 2"). Nome do rótulo é o que a pessoa reconhece;
 * "Pedido #ILD-2481" não diz nada a ninguém.
 */
export function orderTitle(wineNames: string[]): string {
  if (wineNames.length === 0) {
    return 'Pedido';
  }
  const [first, ...rest] = wineNames;
  return rest.length > 0 ? `${first} + ${rest.length}` : first!;
}

export type OrderStatus = 'delivered' | 'transit' | 'preparing' | 'canceled';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  delivered: 'Entregue',
  transit: 'A caminho',
  preparing: 'Em preparo',
  canceled: 'Cancelado',
};

/** Pedido ainda em curso — o que ainda dá para acompanhar no mapa. */
export const isOrderOpen = (status: OrderStatus) =>
  status === 'transit' || status === 'preparing';
