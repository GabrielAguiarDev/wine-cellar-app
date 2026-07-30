/**
 * Dados pessoais: máscara e completude de nome, e-mail, telefone, CPF e
 * nascimento.
 *
 * Lógica pura (sem React, sem `Date`) para `/personal-data`. **Não valida
 * identidade**: dígito verificador de CPF, e-mail que existe de fato e idade
 * mínima são conferência de backend (Fase 16) — aqui só existe o que impede a
 * pessoa de salvar um campo pela metade e o que a UI precisa para desenhar.
 */

import { digitsOnly } from './format';

/**
 * Iniciais para o avatar: primeira e ÚLTIMA palavra, não as duas primeiras —
 * "Helena Maria Prado" é HP, e não HM. Ignora partículas ("de", "da", "dos"),
 * que não são nome de ninguém.
 */
const PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

export function initials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(part => part && !PARTICLES.has(part.toLowerCase()));

  if (parts.length === 0) {
    return '';
  }

  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';

  return (first + last).toUpperCase();
}

/** Primeiro nome — para saudações ("Olá, Helena"). */
export const firstName = (fullName: string) =>
  fullName.trim().split(/\s+/)[0] ?? '';

/** Nome completo = ao menos duas palavras de 2+ letras. */
export const isFullName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(part => part.length >= 2).length >= 2;

/**
 * Forma de e-mail: algo@algo.tld. Deliberadamente frouxa — validar e-mail por
 * regex é caça a exceção, e quem diz se ele existe é o envio da confirmação.
 */
export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim());

/**
 * Telefone BR: "(11) 98765-4321" no celular (11 dígitos) e "(11) 3456-7890" no
 * fixo (10). O corte de 4 dígitos finais é o que difere os dois, então a máscara
 * só decide onde põe o hífen quando o 11º dígito chega.
 */
export function formatPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${ddd}) ${rest}`;
  }

  const breakAt = rest.length > 8 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, breakAt)}-${rest.slice(breakAt)}`;
}

/** Fixo (10) ou celular (11). */
export const isPhoneComplete = (value: string) => {
  const length = digitsOnly(value).length;
  return length === 10 || length === 11;
};

/** "12345678901" → "123.456.789-01". */
export function formatCpf(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  const groups = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
  ].filter(Boolean);
  const check = digits.slice(9);

  const base = groups.join('.');
  return check ? `${base}-${check}` : base;
}

export const isCpfComplete = (value: string) => digitsOnly(value).length === 11;

/** "01021990" → "01/02/1990". Trava dia em 01–31 e mês em 01–12. */
export function formatBirthdate(value: string): string {
  const digits = digitsOnly(value).slice(0, 8);
  if (!digits) {
    return '';
  }

  const clamp = (part: string, max: number) => {
    if (part.length < 2) {
      return part;
    }
    const asNumber = Number(part);
    if (asNumber === 0) {
      return '01';
    }
    return asNumber > max ? String(max) : part;
  };

  const day = clamp(digits.slice(0, 2), 31);
  const month = clamp(digits.slice(2, 4), 12);
  const year = digits.slice(4);

  return [day, month, year].filter(Boolean).join('/');
}

/**
 * Só a FORMA (DD/MM/AAAA com dia/mês possíveis e ano de 4 dígitos). Se a data
 * existe no calendário e se a pessoa é maior de 18 é conferência de backend — a
 * segunda depende de "hoje", e regra que depende de `Date` não pertence a uma
 * função pura testável.
 */
export const isBirthdateComplete = (value: string) => {
  const digits = digitsOnly(value);
  if (digits.length !== 8) {
    return false;
  }

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4));

  return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900;
};
