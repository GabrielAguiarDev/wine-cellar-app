import { describe, expect, it } from '@jest/globals';

import { checkoutTotal, frete, pointsDiscount } from '../pricing';

describe('pointsDiscount', () => {
  it('é zero quando não usa pontos', () => {
    expect(pointsDiscount(500, false)).toBe(0);
  });

  it('desconta até R$ 64', () => {
    expect(pointsDiscount(500, true)).toBe(64);
  });

  it('não passa do subtotal', () => {
    expect(pointsDiscount(40, true)).toBe(40);
  });
});

describe('frete', () => {
  it('é grátis acima de R$ 300', () => {
    expect(frete(301)).toBe(0);
  });

  it('cobra R$ 29 até R$ 300', () => {
    expect(frete(300)).toBe(29);
    expect(frete(50)).toBe(29);
  });
});

describe('checkoutTotal', () => {
  it('subtotal + frete quando abaixo do grátis, sem pontos', () => {
    // 189 + 29 = 218
    expect(checkoutTotal(189, false, true)).toBe(218);
  });

  it('frete grátis acima de 300', () => {
    expect(checkoutTotal(489, false, true)).toBe(489);
  });

  it('aplica desconto de pontos', () => {
    // 489 - 64 = 425 (frete grátis)
    expect(checkoutTotal(489, true, true)).toBe(425);
  });

  it('não cobra frete quando não há itens', () => {
    expect(checkoutTotal(0, false, false)).toBe(0);
  });
});
