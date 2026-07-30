import { orderMonthKey, type OrderStatus } from '@utils/order';

import { WINES } from './wines';

/**
 * Histórico de pedidos — mock de `/orders`.
 *
 * Os itens apontam para `WINES` por **id**, e não repetem nome nem preço: o
 * pedido é uma referência ao catálogo, e nome duplicado aqui divergiria do
 * rótulo no dia em que ele fosse renomeado. O `total` continua gravado no pedido
 * de propósito — é o que foi pago naquele dia, e ele NÃO deve mudar quando o
 * preço do vinho mudar.
 *
 * Datas em `AAAA-MM-DD` (texto, nunca `Date` — ver `@utils/order`), do mais novo
 * para o mais antigo. Cobrem quatro meses e dois anos para exercitar o
 * agrupamento e os quatro estados.
 */
export type OrderItem = {
  wineId: string;
  qty: number;
};

export type Order = {
  /** Número que a pessoa vê e cita no atendimento. */
  id: string;
  /** `AAAA-MM-DD`. */
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  /** BRL inteiro, congelado no fechamento do pedido. */
  total: number;
};

export const ORDERS: Order[] = [
  {
    id: 'ILD-2596',
    date: '2026-07-24',
    status: 'transit',
    items: [{ wineId: 'perla-nera', qty: 1 }],
    total: 620,
  },
  {
    id: 'ILD-2571',
    date: '2026-07-12',
    status: 'delivered',
    items: [
      { wineId: 'notte-eterna', qty: 1 },
      { wineId: 'alba-serena', qty: 1 },
    ],
    total: 678,
  },
  {
    id: 'ILD-2504',
    date: '2026-06-28',
    status: 'delivered',
    items: [{ wineId: 'lumiere-blanche', qty: 1 }],
    total: 279,
  },
  {
    id: 'ILD-2488',
    date: '2026-06-09',
    status: 'delivered',
    items: [
      { wineId: 'velluto-rosso', qty: 2 },
      { wineId: 'rosa-dei-venti', qty: 1 },
    ],
    total: 497,
  },
  {
    id: 'ILD-2410',
    date: '2026-05-17',
    status: 'canceled',
    items: [{ wineId: 'corona-reale', qty: 1 }],
    total: 890,
  },
  {
    id: 'ILD-2377',
    date: '2026-04-30',
    status: 'delivered',
    items: [
      { wineId: 'sangue-di-terra', qty: 1 },
      { wineId: 'fiore-inverno', qty: 1 },
      { wineId: 'aurora-del-sud', qty: 1 },
    ],
    total: 607,
  },
  {
    id: 'ILD-2201',
    date: '2025-12-21',
    status: 'delivered',
    items: [
      { wineId: 'notte-eterna', qty: 2 },
      { wineId: 'lumiere-blanche', qty: 1 },
    ],
    total: 1257,
  },
];

/** Linha do pedido já resolvida contra o catálogo. */
export type OrderLine = {
  wineId: string;
  name: string;
  qty: number;
};

/**
 * Junta o pedido ao catálogo. Item cujo vinho saiu do catálogo é **descartado**
 * (e não vira "Vinho indisponível"): o histórico existe para reconhecer o que se
 * comprou, e uma linha sem nome não ajuda ninguém. O `total` do pedido não muda
 * por causa disso — ele é o que foi pago.
 */
export const orderLines = (order: Order): OrderLine[] =>
  order.items
    .map(item => {
      const wine = WINES.find(w => w.id === item.wineId);
      return wine
        ? { wineId: item.wineId, name: wine.name, qty: item.qty }
        : null;
    })
    .filter((line): line is OrderLine => line !== null);

/** Só os nomes — é o que `orderTitle` espera. */
export const orderWineNames = (order: Order) =>
  orderLines(order).map(line => line.name);

export type OrderMonth = {
  key: string;
  orders: Order[];
};

/**
 * Pedidos agrupados por mês, do mais recente para o mais antigo. Ordena por
 * `date` aqui dentro em vez de confiar na ordem do mock — quando o backend
 * entrar (Fase 16), a lista chega na ordem dele.
 */
export function ordersByMonth(orders: Order[] = ORDERS): OrderMonth[] {
  const sorted = [...orders].sort((a, b) => b.date.localeCompare(a.date));
  const months: OrderMonth[] = [];

  for (const order of sorted) {
    const key = orderMonthKey(order.date);
    const current = months[months.length - 1];

    if (current?.key === key) {
      current.orders.push(order);
    } else {
      months.push({ key, orders: [order] });
    }
  }

  return months;
}

/** Os N mais recentes — o rail "Pedidos recentes" do Perfil. */
export const recentOrders = (count = 2, orders: Order[] = ORDERS) =>
  [...orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);

/**
 * Resumo do histórico para a linha de apoio da tela. Pedido **cancelado não
 * entra no total gasto** — dinheiro que voltou não é dinheiro gasto —, mas
 * continua contando como pedido feito, porque ele aconteceu.
 */
export function ordersSummary(orders: Order[] = ORDERS) {
  const spent = orders
    .filter(order => order.status !== 'canceled')
    .reduce((sum, order) => sum + order.total, 0);

  const firstYear = orders
    .reduce(
      (earliest, order) => (order.date < earliest ? order.date : earliest),
      orders[0]?.date ?? '',
    )
    .slice(0, 4);

  return { count: orders.length, spent, firstYear };
}
