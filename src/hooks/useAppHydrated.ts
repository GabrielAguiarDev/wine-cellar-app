import { useEffect, useState } from 'react';

import { useAuthStore, useUserStore } from '@store/index';

/**
 * Os stores persistidos do app. Lista EXPLÍCITA: store persistido novo que não
 * entrar aqui faz o gate decidir a rota antes de conhecer o estado dele — e o
 * sintoma é uma tela piscando na abertura, só em quem já usava o app.
 */
const PERSISTED = [useUserStore, useAuthStore] as const;

/**
 * `true` quando TODOS os stores persistidos já leram o AsyncStorage.
 *
 * Existe porque o gate (`app/index.tsx`) precisa das flags de onboarding **e**
 * da sessão para decidir a rota, e as duas chegam de forma assíncrona. Decidir
 * antes disso mandaria todo mundo para os slides de boas-vindas a cada abertura.
 *
 * Quem cobre a espera é a `AnimatedSplash` (overlay do layout raiz), então o
 * `null` que o gate renderiza nesse intervalo não é visível.
 */
export function useAppHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    PERSISTED.every(store => store.persist.hasHydrated()),
  );

  useEffect(() => {
    if (hydrated) {
      return;
    }

    // O `hasHydrated()` de cada store já é `true` quando seu listener dispara,
    // então basta reavaliar o conjunto a cada término.
    const unsubs = PERSISTED.map(store =>
      store.persist.onFinishHydration(() => {
        if (PERSISTED.every(other => other.persist.hasHydrated())) {
          setHydrated(true);
        }
      }),
    );

    return () => unsubs.forEach(unsub => unsub());
  }, [hydrated]);

  return hydrated;
}
