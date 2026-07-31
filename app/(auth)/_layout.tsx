import { Stack } from 'expo-router';

/**
 * Grupo de entrada. Três rotas, porque a entrada por código tem três momentos e
 * cada um é um passo com volta própria:
 *
 *   /sign-in  → como você quer entrar (Apple · Google · código)
 *   /code     → para onde mandamos o código (um campo: e-mail OU telefone)
 *   /verify   → os 6 dígitos
 *
 * Um campo dentro da própria `/sign-in` (em vez de `/code`) foi descartado: a
 * tela de escolha ficaria com um formulário dentro dela e a volta do teclado
 * viraria estado local. Como telas separadas, o "voltar" nativo já é a resposta
 * certa para "digitei o e-mail errado".
 *
 * Aqui o gesto de voltar fica LIGADO (ao contrário de `(onboarding)`): dentro do
 * fluxo há para onde voltar. O que impede a pessoa de voltar para os slides é a
 * guarda no layout raiz, não a pilha.
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
