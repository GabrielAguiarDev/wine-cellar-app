/**
 * Endereço: máscara de CEP, linhas de exibição e prazo de entrega por UF.
 *
 * Lógica pura (sem React, sem `Date`) para `/addresses` e `/add-address`.
 */

import { digitsOnly } from './format';

/** "05435000" → "05435-000". */
export function formatCep(value: string): string {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export const isCepComplete = (value: string) => digitsOnly(value).length === 8;

/** Duas letras, maiúsculas — o que a máscara do campo de UF aceita. */
export const formatUf = (value: string) =>
  value
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();

type AddressParts = {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  uf: string;
  cep: string;
};

/** "Rua Harmonia, 421 · apto 52" — a linha que identifica o endereço na lista. */
export function addressLine(address: AddressParts): string {
  const base = `${address.street}, ${address.number}`;
  return address.complement ? `${base} · ${address.complement}` : base;
}

/** "Vila Madalena · São Paulo, SP" — a linha de apoio. */
export const addressRegionLine = (address: AddressParts) =>
  `${address.district} · ${address.city}, ${address.uf}`;

/**
 * UFs com entrega em 24h — as duas capitais onde a adega tem transporte
 * climatizado próprio (é a mesma regra que a FAQ conta em `data/faq.ts`; se uma
 * mudar, a outra tem de mudar junto).
 *
 * Por UF, e não por cidade, porque o mock não tem malha de cidade — quando o
 * backend entrar (Fase 16), o prazo vem dele por CEP e esta função sai.
 */
const NEXT_DAY_UFS = new Set(['SP', 'RJ']);

export type DeliveryEstimate = {
  label: string;
  /** `true` quando é o prazo curto — a UI destaca só esse caso. */
  express: boolean;
};

export function deliveryEstimate(uf: string): DeliveryEstimate {
  return NEXT_DAY_UFS.has(uf.toUpperCase())
    ? { label: 'Entrega em 24h', express: true }
    : { label: 'Entrega em 2 a 5 dias úteis', express: false };
}
