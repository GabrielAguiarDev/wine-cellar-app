/**
 * Fronteira de rede da autenticação — **o único arquivo que a Fase 16 troca.**
 *
 * Hoje devolve dados falsos com atraso artificial, para as telas nascerem já
 * lidando com o que o backend real impõe: espera, erro e cancelamento. Quando a
 * API existir, o corpo destas funções vira `fetch` e nada acima muda — é esse o
 * contrato.
 *
 * É também o único módulo do domínio que lê o RELÓGIO (`Date`) e sorteia id.
 * Isso é de propósito: mantém `otp.ts` e `authGate.ts` puros e testáveis.
 *
 * ⚠️ Social real (Apple/Google) exige módulo NATIVO — `expo-apple-authentication`
 * e o `@react-native-google-signin/google-signin` (ou `expo-auth-session`), que
 * não estão instalados. `signInWithProvider` é o buraco onde a credencial do
 * provedor entra: a folha nativa devolve um `identityToken`, ele vai para o
 * backend e o backend devolve a `AuthSession`. A assinatura já prevê isso.
 */

import {
  AuthError,
  type AuthProvider,
  type AuthSession,
  type OtpChallenge,
  type OtpChannel,
} from './authTypes';
import { OTP_LENGTH } from './otp';

/** Atraso do mock — o suficiente para o estado de "entrando…" aparecer na tela. */
const MOCK_LATENCY_MS = 700;

/** Validade do código. 5 min é o padrão de mercado. */
const OTP_TTL_MS = 5 * 60 * 1000;

/** Duração da sessão mock (30 dias, como um refresh token de app de varejo). */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Código que o mock aceita. Fica exportado para as telas poderem exibir a dica
 * em desenvolvimento — e para o dia em que ela tiver de sair daqui: buscar por
 * este símbolo encontra todos os pontos a limpar.
 */
export const MOCK_OTP_CODE = '000000';

/** A mesma persona que o app já usa nos mocks (`useUserStore`, `/personal-data`). */
const MOCK_USER = {
  id: 'usr_helena',
  name: 'Helena Prado',
  email: 'helena.prado@email.com',
  phone: '(11) 98765-4321',
};

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const isoIn = (ms: number) => new Date(Date.now() + ms).toISOString();

function buildSession(
  provider: AuthProvider,
  channel?: OtpChannel,
): AuthSession {
  return {
    token: `mock-token-${provider}`,
    issuedAt: isoIn(0),
    expiresAt: isoIn(SESSION_TTL_MS),
    user: {
      ...MOCK_USER,
      // Entrar por telefone não revela e-mail (e vice-versa) — a sessão devolve
      // só o que aquele canal provou.
      email: channel === 'phone' ? '' : MOCK_USER.email,
      phone: channel === 'email' ? '' : MOCK_USER.phone,
      provider,
    },
  };
}

export const authApi = {
  /**
   * Troca a credencial do provedor por uma sessão nossa.
   *
   * `identityToken` é opcional só enquanto o mock existe — com o SDK nativo
   * instalado ele passa a ser obrigatório e a folha nativa é quem o produz.
   */
  async signInWithProvider(
    provider: Extract<AuthProvider, 'apple' | 'google'>,
    _identityToken?: string,
  ): Promise<AuthSession> {
    await delay(MOCK_LATENCY_MS);
    return buildSession(provider);
  },

  /** Dispara o envio do código. Devolve o desafio, não o código. */
  async requestOtp(input: {
    channel: OtpChannel;
    destination: string;
  }): Promise<OtpChallenge> {
    await delay(MOCK_LATENCY_MS);
    return {
      id: `otp_${Math.random().toString(36).slice(2, 10)}`,
      channel: input.channel,
      destination: input.destination,
      length: OTP_LENGTH,
      expiresAt: isoIn(OTP_TTL_MS),
    };
  },

  /**
   * Confere o código. **Quem decide se o código está certo é o servidor** — por
   * isso a comparação mora aqui e não no service: no mundo real o app não tem o
   * código para comparar.
   */
  async verifyOtp(input: {
    challenge: OtpChallenge;
    code: string;
  }): Promise<AuthSession> {
    await delay(MOCK_LATENCY_MS);

    if (input.code !== MOCK_OTP_CODE) {
      throw new AuthError('invalid-code');
    }

    return buildSession('otp', input.challenge.channel);
  },

  /** Invalida a sessão no servidor. O app apaga a dele mesmo se isto falhar. */
  async signOut(): Promise<void> {
    await delay(MOCK_LATENCY_MS / 2);
  },

  /** Relógio do domínio. Existe para `authService` não importar `Date` direto. */
  nowIso(): string {
    return isoIn(0);
  },
};
