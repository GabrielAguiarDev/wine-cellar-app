import { describe, expect, it } from '@jest/globals';

import {
  ORDERS,
  orderLines,
  orderWineNames,
  ordersByMonth,
  ordersSummary,
  recentOrders,
  type Order,
} from '../orders';

const GHOST: Order = {
  id: 'ILD-0001',
  date: '2024-01-02',
  status: 'delivered',
  items: [
    { wineId: 'notte-eterna', qty: 1 },
    { wineId: 'vinho-que-saiu-do-catalogo', qty: 3 },
  ],
  total: 999,
};

describe('orderLines', () => {
  it('resolve os itens contra o catálogo', () => {
    const lines = orderLines(ORDERS[1]!);
    expect(lines).toEqual([
      { wineId: 'notte-eterna', name: 'Notte Eterna', qty: 1 },
      { wineId: 'alba-serena', name: 'Alba Serena', qty: 1 },
    ]);
  });

  it('descarta item cujo vinho não está mais no catálogo', () => {
    expect(orderLines(GHOST)).toHaveLength(1);
    expect(orderWineNames(GHOST)).toEqual(['Notte Eterna']);
  });
});

describe('ordersByMonth', () => {
  it('agrupa por mês, do mais recente para o mais antigo', () => {
    const months = ordersByMonth();
    expect(months.map(m => m.key)).toEqual([
      '2026-07',
      '2026-06',
      '2026-05',
      '2026-04',
      '2025-12',
    ]);
    expect(months[0]!.orders).toHaveLength(2);
  });

  it('ordena por data mesmo quando a lista chega bagunçada', () => {
    const months = ordersByMonth([
      ORDERS[2]!, // 2026-06-28
      ORDERS[0]!, // 2026-07-24
      ORDERS[1]!, // 2026-07-12
    ]);
    expect(months.map(m => m.key)).toEqual(['2026-07', '2026-06']);
    expect(months[0]!.orders.map(o => o.id)).toEqual(['ILD-2596', 'ILD-2571']);
  });

  it('devolve lista vazia sem pedidos', () => {
    expect(ordersByMonth([])).toEqual([]);
  });
});

describe('recentOrders', () => {
  it('pega os mais novos', () => {
    expect(recentOrders(2).map(o => o.id)).toEqual(['ILD-2596', 'ILD-2571']);
  });
});

describe('ordersSummary', () => {
  it('conta todos os pedidos mas não soma o cancelado', () => {
    const { count, spent } = ordersSummary([
      { ...GHOST, total: 100, status: 'delivered' },
      { ...GHOST, id: 'x', total: 500, status: 'canceled' },
    ]);
    expect(count).toBe(2);
    expect(spent).toBe(100);
  });

  it('acha o ano do pedido mais antigo', () => {
    expect(ordersSummary().firstYear).toBe('2025');
  });
});
