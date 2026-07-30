import { describe, expect, it } from '@jest/globals';

import {
  formatOrderDate,
  isOrderOpen,
  orderMonthKey,
  orderMonthLabel,
  orderTitle,
} from '../order';

describe('formatOrderDate', () => {
  it('formata dia e mês curto', () => {
    expect(formatOrderDate('2026-07-12')).toBe('12 jul');
    expect(formatOrderDate('2025-12-21')).toBe('21 dez');
  });

  it('tira o zero à esquerda do dia', () => {
    expect(formatOrderDate('2026-01-05')).toBe('5 jan');
  });

  it('devolve a entrada quando o mês não existe', () => {
    expect(formatOrderDate('2026-13-01')).toBe('2026-13-01');
  });
});

describe('orderMonthKey / orderMonthLabel', () => {
  it('agrupa por ano-mês', () => {
    expect(orderMonthKey('2026-07-12')).toBe('2026-07');
  });

  it('escreve o mês por extenso', () => {
    expect(orderMonthLabel('2026-07')).toBe('Julho de 2026');
    expect(orderMonthLabel('2025-03')).toBe('Março de 2025');
  });
});

describe('orderTitle', () => {
  it('mostra o primeiro rótulo e conta o resto', () => {
    expect(orderTitle(['Notte Eterna'])).toBe('Notte Eterna');
    expect(orderTitle(['Notte Eterna', 'Alba Serena'])).toBe(
      'Notte Eterna + 1',
    );
    expect(orderTitle(['A', 'B', 'C'])).toBe('A + 2');
  });

  it('não quebra com pedido sem itens no catálogo', () => {
    expect(orderTitle([])).toBe('Pedido');
  });
});

describe('isOrderOpen', () => {
  it('só está aberto o que ainda se move', () => {
    expect(isOrderOpen('transit')).toBe(true);
    expect(isOrderOpen('preparing')).toBe(true);
    expect(isOrderOpen('delivered')).toBe(false);
    expect(isOrderOpen('canceled')).toBe(false);
  });
});
