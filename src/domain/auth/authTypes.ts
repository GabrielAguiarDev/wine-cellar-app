/**
 * Tipos do domínio de autenticação — a FORMA do contrato com o backend.
 *
 * Este é o primeiro domínio do app (`src/domain/`, alias `@domain`). O resto do
 * app ainda roda com mocks em `@data`; aqui a divisão em camadas já existe
 * porque autenticação é a única coisa que **nunca** poderá ser mock:
 *
 *   authTypes.ts   → o contrato (este arquivo)
 *   otp.ts         → lógica pura (canal, máscara, validade) — testável
 *   authApi.ts     → a fronteira de rede: o ÚNICO arquivo que a Fase 16 troca
 *   authService.ts → as regras que a UI chama (valida antes de sair na rede)
 *   authGate.ts    → para onde ir depois (puro) — ver `app/index.tsx`
 *
 * Datas são **string ISO 8601**, nunca `Date` — mesma regra de `@utils/order`.
 * Quem lê um relógio de verdade é só `authApi` (e é por isso que ele é o único
 * módulo do domínio sem teste puro).
 */

/** Como a pessoa entrou. Definido pelo usuário: social + código, sem senha. */
export type AuthProvider = 'apple' | 'google' | 'otp';

/** Por onde o código de 6 dígitos foi enviado. */
export type OtpChannel = 'email' | 'phone';

/**
 * A identidade que o backend devolve. É de LEITURA: quem edita cadastro é
 * `useUserStore.profile` (a tela `/personal-data`). Os dois convivem de
 * propósito — a sessão diz quem a pessoa é para a API, o profile é o formulário
 * que ela mexe. Na Fase 16 o profile passa a nascer daqui.
 */
export type AuthUser = {
  id: string;
  name: string;
  /** Vazio quando a entrada foi por telefone. */
  email: string;
  /** Mascarado ("(11) 98765-4321"). Vazio quando a entrada foi por e-mail. */
  phone: string;
  provider: AuthProvider;
};

export type AuthSession = {
  /** Bearer das requisições. Hoje um mock; na Fase 16 vem da API. */
  token: string;
  /** ISO 8601. */
  issuedAt: string;
  /**
   * ISO 8601. O gate **não** expira sessão por conta própria: quem manda é o
   * 401 do backend (Fase 16), senão o app deslogaria a pessoa por causa do
   * relógio do aparelho. Fica aqui porque a UI pode querer renovar antes.
   */
  expiresAt: string;
  user: AuthUser;
};

/**
 * Desafio em aberto: o código foi enviado e espera-se a digitação. Vive em
 * `useAuthStore` **sem persistência** — código de 5 minutos não sobrevive a um
 * relaunch, e ressuscitar um desafio morto é pior que pedir de novo.
 */
export type OtpChallenge = {
  id: string;
  channel: OtpChannel;
  /** Como foi digitado (já mascarado, no caso do telefone). */
  destination: string;
  /** Quantos dígitos o código tem — a UI desenha essa quantidade de casas. */
  length: number;
  expiresAt: string;
};

export type AuthErrorCode =
  | 'invalid-destination'
  | 'invalid-code'
  | 'expired-code'
  /** A pessoa fechou a folha nativa da Apple/Google. Não é erro: é desistência. */
  | 'canceled'
  | 'network'
  | 'unknown';

/**
 * Erro do domínio. Existe para a UI não precisar interpretar mensagem de rede:
 * ela lê `code` e escolhe o texto em `AUTH_ERROR_MESSAGE`.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? AUTH_ERROR_MESSAGE[code]);
    this.name = 'AuthError';
    this.code = code;
  }
}

/** Mensagens em pt-BR — o que o toast mostra. */
export const AUTH_ERROR_MESSAGE: Record<AuthErrorCode, string> = {
  'invalid-destination': 'Confira o e-mail ou o telefone informado.',
  'invalid-code': 'Código incorreto. Tente novamente.',
  'expired-code': 'Esse código expirou. Pedimos um novo.',
  canceled: 'Entrada cancelada.',
  network: 'Sem conexão. Tente novamente em instantes.',
  unknown: 'Não foi possível entrar agora.',
};

/** Normaliza qualquer `catch` em um código conhecido. */
export function toAuthErrorCode(error: unknown): AuthErrorCode {
  return error instanceof AuthError ? error.code : 'unknown';
}
