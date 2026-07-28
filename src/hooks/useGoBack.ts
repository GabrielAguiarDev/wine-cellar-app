import { useCallback } from 'react';

import { type Href, useRouter } from 'expo-router';

/**
 * Voltar de tela empilhada, à prova de pilha vazia.
 *
 * `router.back()` é um no-op quando a tela é a PRIMEIRA da pilha — o que
 * acontece sempre que ela é aberta por deep link (`yydivinomobile://…`) ou, no
 * futuro, pelo toque numa push. Aí o botão parece quebrado. Nesses casos o
 * destino é o `fallback` (em geral a Home ou a aba de onde a tela costuma ser
 * aberta).
 */
export function useGoBack(fallback: Href) {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate(fallback);
  }, [router, fallback]);
}
