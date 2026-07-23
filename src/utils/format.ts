/**
 * Formata um inteiro em BRL: 489 → "R$ 489"; 1200 → "R$ 1.200".
 * Agrupamento manual (sem depender de Intl) para consistência entre plataformas.
 */
export function brl(value: number): string {
  const inteiro = Math.round(value);
  const negativo = inteiro < 0;
  const digitos = Math.abs(inteiro).toString();
  const comSeparador = digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${negativo ? '-' : ''}${comSeparador}`;
}

/** Formata nota com 1 casa decimal e vírgula: 4.7 → "4,7". */
export function nf(value: number): string {
  return value.toFixed(1).replace('.', ',');
}
