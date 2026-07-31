import { Redirect } from 'expo-router';

import { resolveGateRoute } from '@domain/auth';
import { useAppHydrated } from '@hooks/useAppHydrated';
import { useAuthStore, useUserStore } from '@store/index';

/**
 * Entrada do app — só um PORTÃO: espera a hidratação dos stores persistidos e
 * encaminha para a primeira etapa pendente (slides → entrar → paladar → Home).
 *
 * Não desenha nada de propósito. Quem cobre a espera é a `AnimatedSplash`
 * (overlay do layout raiz), e a regra de "para onde" mora em `resolveGateRoute`
 * (`@domain/auth/authGate`), compartilhada com as telas de cada etapa.
 *
 * Esta rota é também o **destino de fallback** quando uma `Stack.Protected` do
 * layout raiz remove a rota ativa (ex.: a sessão nasce e o grupo `(auth)` deixa
 * de existir). Por isso ela precisa continuar barata e idempotente: reavaliar as
 * flags sempre dá a mesma resposta que a tela daria.
 */
export default function Index() {
  const hydrated = useAppHydrated();
  const welcomeSeen = useUserStore(s => s.welcomeSeen);
  const palateDone = useUserStore(s => s.palateDone);
  const session = useAuthStore(s => s.session);

  if (!hydrated) {
    return null;
  }

  return (
    <Redirect
      href={resolveGateRoute({
        welcomeSeen,
        signedIn: !!session,
        palateDone,
      })}
    />
  );
}
