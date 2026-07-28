/**
 * Formata um inteiro em BRL: 489 → "R$ 489"; 1200 → "R$ 1.200".
 * Agrupamento manual (sem depender de Intl) para consistência entre plataformas.
 */
export function brl(value: number): string {
  const integer = Math.round(value);
  const negative = integer < 0;
  const digits = Math.abs(integer).toString();
  const withSeparator = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${negative ? '-' : ''}${withSeparator}`;
}

/** Formata nota com 1 casa decimal e vírgula: 4.7 → "4,7". */
export function nf(value: number): string {
  return value.toFixed(1).replace('.', ',');
}
