/**
 * Cartão de crédito: bandeira, agrupamento e máscara.
 *
 * Lógica pura (sem React, sem `Date`) para o cadastro de cartão em
 * `/payment-methods` — é o que a face do `FlipCard` mostra enquanto a pessoa
 * digita. Validade de fato (vencido, BIN, Luhn) é assunto do backend na Fase 16;
 * aqui só existe o que a UI precisa para desenhar e para não deixar avançar com
 * campo pela metade.
 */

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'unknown';

/** Rótulo de exibição da bandeira. `unknown` não diz "desconhecida" na UI. */
export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
  unknown: 'Cartão',
};

/**
 * Versão curta, para o selo da lista. "Mastercard" em caixa alta não cabe num
 * selo de 46px e quebrava em "MASTERC / ARD".
 */
export const CARD_BRAND_SHORT: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MASTER',
  elo: 'ELO',
  amex: 'AMEX',
  unknown: 'CARTÃO',
};

/** Amex é 15 dígitos em 4-6-5; o resto, 16 em quatro grupos de 4. */
const GROUPS: Record<CardBrand, number[]> = {
  amex: [4, 6, 5],
  visa: [4, 4, 4, 4],
  mastercard: [4, 4, 4, 4],
  elo: [4, 4, 4, 4],
  unknown: [4, 4, 4, 4],
};

/**
 * Prefixos Elo. Vêm ANTES de Visa/Mastercard porque colidem com eles — 4011 é
 * um 4 (Visa) e 5067 é um 50 (Mastercard). Sem esta ordem, cartão Elo brasileiro
 * é sempre rotulado errado.
 */
const ELO_PREFIXES = [
  '4011',
  '4312',
  '4389',
  '4514',
  '4576',
  '5041',
  '5066',
  '5067',
  '509',
  '6277',
  '6362',
  '6363',
  '650',
  '6516',
  '6550',
];

export const digitsOnly = (value: string) => value.replace(/\D+/g, '');

export function cardBrand(value: string): CardBrand {
  const digits = digitsOnly(value);
  if (!digits) {
    return 'unknown';
  }
  if (ELO_PREFIXES.some(prefix => digits.startsWith(prefix))) {
    return 'elo';
  }
  if (digits.startsWith('34') || digits.startsWith('37')) {
    return 'amex';
  }
  if (digits.startsWith('4')) {
    return 'visa';
  }
  const two = Number(digits.slice(0, 2));
  if (two >= 51 && two <= 55) {
    return 'mastercard';
  }
  const four = Number(digits.slice(0, 4));
  if (digits.length >= 4 && four >= 2221 && four <= 2720) {
    return 'mastercard';
  }
  return 'unknown';
}

export const cardMaxDigits = (brand: CardBrand) =>
  GROUPS[brand].reduce((total, size) => total + size, 0);

/** CVV do Amex tem 4 dígitos; dos outros, 3. */
export const cardCvvLength = (brand: CardBrand) => (brand === 'amex' ? 4 : 3);

/** "4111111111111111" → "4111 1111 1111 1111". Corta no tamanho da bandeira. */
export function formatCardNumber(value: string): string {
  const brand = cardBrand(value);
  const digits = digitsOnly(value).slice(0, cardMaxDigits(brand));
  const out: string[] = [];
  let cursor = 0;

  for (const size of GROUPS[brand]) {
    if (cursor >= digits.length) {
      break;
    }
    out.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }

  return out.join(' ');
}

/**
 * O número como ele aparece na face do cartão: dígitos digitados no lugar, o
 * resto em bolinha. Sempre a máscara COMPLETA — a face não pode encolher e
 * crescer a cada tecla.
 */
export function cardNumberPreview(value: string): string {
  const brand = cardBrand(value);
  const digits = digitsOnly(value).slice(0, cardMaxDigits(brand));
  let cursor = 0;

  return GROUPS[brand]
    .map(size => {
      const group = Array.from(
        { length: size },
        (_, index) => digits[cursor + index] ?? '•',
      ).join('');
      cursor += size;
      return group;
    })
    .join(' ');
}

/** "0928" → "09/28". Trava o mês em 01–12 já na digitação. */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (!digits) {
    return '';
  }

  let month = digits.slice(0, 2);
  // "5" só pode ser maio → completa para "05"; "13" não existe → "12".
  if (month.length === 1 && Number(month) > 1) {
    month = `0${month}`;
  } else if (month.length === 2) {
    const monthValue = Number(month);
    if (monthValue === 0) {
      month = '01';
    } else if (monthValue > 12) {
      month = '12';
    }
  }

  const year = digits.slice(2);
  return year ? `${month}/${year}` : month;
}

export const isCardNumberComplete = (value: string) => {
  const brand = cardBrand(value);
  return digitsOnly(value).length === cardMaxDigits(brand);
};

/** Só forma (MM/AA com mês válido). Vencimento no passado é regra de backend. */
export const isExpiryComplete = (value: string) => {
  const digits = digitsOnly(value);
  if (digits.length !== 4) {
    return false;
  }
  const month = Number(digits.slice(0, 2));
  return month >= 1 && month <= 12;
};

export const isCvvComplete = (value: string, brand: CardBrand) =>
  digitsOnly(value).length === cardCvvLength(brand);

/** Últimos 4 dígitos — o que fica salvo e listado. */
export const cardLast4 = (value: string) => digitsOnly(value).slice(-4);
