/** Regras de preço do checkout (idênticas ao protótipo). */

/** 320 pontos de fidelidade = R$ 64 de desconto máximo. */
export const MAX_POINTS_DISCOUNT = 64;

/** Frete grátis acima deste subtotal. */
export const FREE_SHIPPING_ABOVE = 300;

/** Valor do frete quando não é grátis. */
export const DEFAULT_SHIPPING = 29;

/** Desconto aplicado ao usar pontos (limitado ao subtotal). */
export function pointsDiscount(subtotal: number, usePoints: boolean): number {
  return usePoints ? Math.min(subtotal, MAX_POINTS_DISCOUNT) : 0;
}

/** Frete: grátis acima de R$ 300, senão R$ 29. */
export function shipping(subtotal: number): number {
  return subtotal > FREE_SHIPPING_ABOVE ? 0 : DEFAULT_SHIPPING;
}

/**
 * Total do checkout: max(0, subtotal − desconto) + frete (só se houver itens).
 */
export function checkoutTotal(
  subtotal: number,
  usePoints: boolean,
  hasItems: boolean,
): number {
  const discount = pointsDiscount(subtotal, usePoints);
  const shippingValue = hasItems ? shipping(subtotal) : 0;
  return Math.max(0, subtotal - discount) + shippingValue;
}
