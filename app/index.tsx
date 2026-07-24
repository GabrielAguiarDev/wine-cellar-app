import { useEffect, useState } from 'react';

import { Redirect } from 'expo-router';

import { useUserStore } from '@store/index';

/**
 * Entrada do app. A splash animada (Lottie) é um overlay do root layout.
 * Aguarda a hidratação do storage e então encaminha: primeiro acesso vai para
 * o quiz de paladar; nas próximas vezes vai direto para a Home.
 */
export default function Index() {
  const [hydrated, setHydrated] = useState(() =>
    useUserStore.persist.hasHydrated(),
  );
  const onboarded = useUserStore(s => s.onboarded);

  useEffect(() => {
    // O initializer de useState já cobre o caso de já estar hidratado; aqui só
    // assinamos o término da hidratação assíncrona (AsyncStorage).
    const unsub = useUserStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  // Enquanto não hidrata, a splash cobre a tela — não renderiza rota ainda.
  if (!hydrated) {
    return null;
  }

  return <Redirect href={onboarded ? '/home' : '/quiz'} />;
}
