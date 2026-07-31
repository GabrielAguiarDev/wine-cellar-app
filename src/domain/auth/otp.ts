/**
 * Entrada por código (OTP) — lógica PURA: descobrir o canal a partir do que foi
 * digitado, mascarar, e dizer se código/desafio ainda valem.
 *
 * Um campo só para e-mail **ou** telefone é decisão de produto: a pessoa digita
 * e o app descobre o canal, em vez de obrigá-la a escolher uma aba antes de
 * saber o que vai digitar. Toda a esperteza disso está aqui, testada, para as
 * telas não repetirem a adivinhação.
 *
 * Sem React, sem `Date`: "agora" entra como parâmetro (ISO) — quem tem relógio
 * é `authApi`.
 */

// Módulos DIRETOS, não o barrel `@utils/index`: ele reexporta `wineViewModel`,
// que puxa o tema (restyle → react-native) e derrubaria o jest puro deste
// domínio. Mesma razão pela qual `person.ts` importa `./format`, e não o barrel.
import { digitsOnly } from '@utils/format';
import { formatPhone, isEmail, isPhoneComplete } from '@utils/person';

import { type OtpChannel, type OtpChallenge } from './authTypes';

/** Dígitos do código. 6 é o padrão de mercado (e o que o teclado numérico serve bem). */
export const OTP_LENGTH = 6;

/**
 * O que separa "telefone" de "e-mail" é a presença de caractere que telefone
 * nunca tem: letra, `@` ou ponto. Tudo o mais (dígito, espaço, parêntese, hífen,
 * `+`) é telefone — inclusive o campo VAZIO, que começa como telefone porque é
 * o teclado que abre primeiro sem incomodar (dá para digitar letra nele no
 * Android; no iOS a tela troca o `keyboardType` conforme o canal muda).
 */
export function otpChannelOf(value: string): OtpChannel {
  return /[a-z@]/i.test(value) ? 'email' : 'phone';
}

/**
 * Máscara ao vivo. Telefone recebe a mesma máscara de `/personal-data` (uma só
 * no app); e-mail só perde espaço nas pontas — mexer em maiúscula/minúscula
 * enquanto se digita é o tipo de ajuda que atrapalha.
 */
export function formatOtpDestination(value: string): string {
  return otpChannelOf(value) === 'phone' ? formatPhone(value) : value.trim();
}

/** Forma completa: e-mail plausível ou telefone BR (10/11 dígitos). */
export function isOtpDestinationComplete(value: string): boolean {
  return otpChannelOf(value) === 'email'
    ? isEmail(value)
    : isPhoneComplete(value);
}

/**
 * O destino como a tela de confirmação deve mostrá-lo: reconhecível pela pessoa,
 * inútil para quem só espiou a tela.
 *
 * - e-mail: preserva 2 letras e o domínio inteiro — `he•••@email.com`.
 * - telefone: preserva DDD e os 4 últimos — `(11) •••••-4321`.
 */
export function maskOtpDestination(value: string): string {
  if (otpChannelOf(value) === 'email') {
    const [local = '', domain = ''] = value.trim().split('@');
    const head = local.slice(0, 2);
    return `${head}•••@${domain}`;
  }

  const digits = digitsOnly(value);
  if (digits.length < 6) {
    return formatPhone(value);
  }

  const ddd = digits.slice(0, 2);
  const tail = digits.slice(-4);
  const hidden = '•'.repeat(digits.length - 6);
  return `(${ddd}) ${hidden}-${tail}`;
}

/** Só dígitos, no comprimento do código. */
export function formatOtpCode(value: string, length = OTP_LENGTH): string {
  return digitsOnly(value).slice(0, length);
}

export function isOtpCodeComplete(value: string, length = OTP_LENGTH): boolean {
  return formatOtpCode(value, length).length === length;
}

/**
 * Desafio vencido? Compara duas strings ISO — comparação lexicográfica de ISO
 * 8601 em UTC é comparação cronológica, então não há `Date` aqui.
 *
 * `nowIso` vem de quem chama (o service) de propósito: teste puro precisa poder
 * dizer que horas são.
 */
export function isChallengeExpired(
  challenge: OtpChallenge,
  nowIso: string,
): boolean {
  return nowIso >= challenge.expiresAt;
}
