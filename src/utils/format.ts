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

/**
 * Duração em segundos no formato do player: 48 → "0:48"; 65 → "1:05".
 *
 * Mora aqui (e não no story) porque é o mesmo relógio do catálogo: é ele que
 * escreve o `videoDuration` dos destaques a partir do roteiro do sommelier.
 */
export function mmss(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Só os dígitos. Mora aqui porque é o primeiro passo de TODA máscara do app
 * (cartão, CPF, telefone, CEP, datas) — em cada arquivo de máscara viraria a
 * mesma regex copiada quatro vezes.
 */
export const digitsOnly = (value: string) => value.replace(/\D+/g, '');
