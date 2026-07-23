/** Regras de preço do checkout (idênticas ao protótipo). */

/** 320 pontos de fidelidade = R$ 64 de desconto máximo. */
export const PONTOS_DESCONTO_MAX = 64;

/** Frete grátis acima deste subtotal. */
export const FRETE_GRATIS_ACIMA = 300;

/** Valor do frete quando não é grátis. */
export const FRETE_PADRAO = 29;

/** Desconto aplicado ao usar pontos (limitado ao subtotal). */
export function pointsDiscount(subtotal: number, usePoints: boolean): number {
  return usePoints ? Math.min(subtotal, PONTOS_DESCONTO_MAX) : 0;
}

/** Frete: grátis acima de R$ 300, senão R$ 29. */
export function frete(subtotal: number): number {
  return subtotal > FRETE_GRATIS_ACIMA ? 0 : FRETE_PADRAO;
}

/**
 * Total do checkout: max(0, subtotal − desconto) + frete (só se houver itens).
 */
export function checkoutTotal(
  subtotal: number,
  usePoints: boolean,
  hasItems: boolean,
): number {
  const desconto = pointsDiscount(subtotal, usePoints);
  const freteValor = hasItems ? frete(subtotal) : 0;
  return Math.max(0, subtotal - desconto) + freteValor;
}
