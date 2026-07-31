/**
 * As regras de autenticação — é o que a UI chama (via `useAuthStore`).
 *
 * O que ele acrescenta sobre `authApi`:
 *  1. **valida antes de sair na rede** (destino incompleto não vira requisição);
 *  2. **descobre o canal** a partir do que foi digitado (um campo só);
 *  3. **mata desafio vencido no cliente**, sem gastar ida ao servidor;
 *  4. **normaliza erro** — tudo que sai daqui é `AuthError`, nunca erro cru de
 *     rede, para a tela poder mapear `code` → mensagem.
 *
 * Puro em relação ao React: nenhuma dessas funções sabe que existe tela. É o que
 * permite que a Fase 16 as transforme em `mutationFn` do react-query sem tocar
 * numa linha de UI.
 */

import { authApi } from './authApi';
import {
  AuthError,
  type AuthProvider,
  type AuthSession,
  type OtpChallenge,
} from './authTypes';
import {
  isChallengeExpired,
  isOtpCodeComplete,
  isOtpDestinationComplete,
  formatOtpCode,
  otpChannelOf,
} from './otp';

/** Envolve qualquer falha inesperada (rede, parse) num `AuthError`. */
async function guarded<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('network');
  }
}

export const authService = {
  /**
   * Entrada social. `identityToken` chega da folha nativa quando o SDK existir;
   * até lá o mock ignora.
   *
   * ⚠️ Apple é **iOS-only** — quem decide se o botão aparece é a tela
   * (`Platform.OS`), não este módulo: no Android o backend nunca receberia um
   * `identityToken` da Apple para trocar.
   */
  signInWithProvider(
    provider: Extract<AuthProvider, 'apple' | 'google'>,
    identityToken?: string,
  ): Promise<AuthSession> {
    return guarded(() => authApi.signInWithProvider(provider, identityToken));
  },

  /**
   * Pede o código. Recebe o destino **como foi digitado** (já mascarado pela
   * tela) e deduz o canal — a tela não precisa saber se aquilo é e-mail ou
   * telefone.
   */
  async requestOtp(destination: string): Promise<OtpChallenge> {
    if (!isOtpDestinationComplete(destination)) {
      throw new AuthError('invalid-destination');
    }

    return guarded(() =>
      authApi.requestOtp({
        channel: otpChannelOf(destination),
        destination: destination.trim(),
      }),
    );
  },

  /**
   * Confere o código do desafio em aberto.
   *
   * A expiração é checada **aqui**, antes da rede: um código vencido tem resposta
   * conhecida, e mandá-lo só faria a pessoa esperar para receber "não". Se o
   * relógio do aparelho estiver adiantado o preço é pedir um código a mais —
   * bem menor que o de aceitar um vencido.
   */
  async verifyOtp(challenge: OtpChallenge, code: string): Promise<AuthSession> {
    const normalized = formatOtpCode(code, challenge.length);

    if (!isOtpCodeComplete(normalized, challenge.length)) {
      throw new AuthError('invalid-code');
    }

    if (isChallengeExpired(challenge, authApi.nowIso())) {
      throw new AuthError('expired-code');
    }

    return guarded(() => authApi.verifyOtp({ challenge, code: normalized }));
  },

  /**
   * Sai. **Nunca rejeita**: a sessão local é apagada de todo jeito. Se o servidor
   * não puder ser avisado, o pior caso é um token válido lá até expirar — muito
   * melhor que uma pessoa presa dentro do app porque o logout deu erro de rede.
   */
  async signOut(): Promise<void> {
    try {
      await authApi.signOut();
    } catch {
      // Silêncio deliberado — ver acima.
    }
  },
};
