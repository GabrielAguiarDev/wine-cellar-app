/**
 * O portão de entrada do app: dadas as três flags, PARA ONDE ir.
 *
 * Função pura, num arquivo só, porque três lugares diferentes precisam da mesma
 * resposta e discordar entre eles seria um laço de navegação:
 *   • `app/index.tsx` — decide a rota no arranque (e é o destino de fallback
 *     quando uma `Stack.Protected` remove a rota ativa);
 *   • `app/(onboarding)/welcome.tsx` e `app/(auth)/*` — para onde seguir ao
 *     concluir a etapa;
 *   • `app/quiz.tsx` — idem no fim do paladar.
 *
 * **Idempotência é requisito, não elegância.** As telas navegam explicitamente
 * (`router.replace`) E as guardas do `_layout` raiz removem a etapa vencida, o
 * que pode devolver a navegação ao `index`. Como os dois caminhos consultam esta
 * mesma função, o destino é o mesmo — no pior caso um quadro extra em branco,
 * nunca um destino errado.
 *
 * A ordem das etapas é decisão do usuário (2026-07-31):
 *   boas-vindas → entrar → paladar → app
 * Ela sobrevive a interrupção: quem instalou, viu os slides e fechou o app antes
 * de entrar volta em `/sign-in`, não no começo. E quem sai da conta (`signOut`)
 * volta só para `/sign-in` — os slides e o quiz já foram feitos.
 */

/** O passo em que a pessoa está. Nomes de ETAPA, não de rota. */
export type GateStep = 'welcome' | 'signIn' | 'palate' | 'app';

/** As rotas correspondentes. Casadas com a árvore de `app/`. */
export type GateRoute = '/welcome' | '/sign-in' | '/quiz' | '/home';

export type GateFlags = {
  /** Já passou pelos slides de boas-vindas. Persistido em `useUserStore`. */
  welcomeSeen: boolean;
  /** Há sessão válida em `useAuthStore`. */
  signedIn: boolean;
  /** Já respondeu (ou pulou) o quiz de paladar. Persistido em `useUserStore`. */
  palateDone: boolean;
};

export const GATE_ROUTE: Record<GateStep, GateRoute> = {
  welcome: '/welcome',
  signIn: '/sign-in',
  palate: '/quiz',
  app: '/home',
};

/**
 * A primeira etapa pendente, em ordem. Escrito como uma cascata (e não como
 * tabela) porque a regra É a precedência: quem não viu os slides não vê login,
 * mesmo que por algum motivo já tenha sessão gravada.
 */
export function resolveGateStep(flags: GateFlags): GateStep {
  if (!flags.welcomeSeen) {
    return 'welcome';
  }
  if (!flags.signedIn) {
    return 'signIn';
  }
  if (!flags.palateDone) {
    return 'palate';
  }
  return 'app';
}

export function resolveGateRoute(flags: GateFlags): GateRoute {
  return GATE_ROUTE[resolveGateStep(flags)];
}
