import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SommelierStory } from '@components/organisms/sommelier-story';
import { findWine } from '@data/index';

/**
 * Story do sommelier — o "dentro" do preview da tela de produto premium.
 *
 * A tela não desenha fundo próprio: quem ocupa a janela é a forma do
 * `SommelierStory`, que cresce a partir do retângulo do preview (medido no
 * toque e guardado em `useTransitionStore`). Por isso a rota está declarada como
 * `transparentModal` + `animation: 'none'` em `app/_layout.tsx` — a Stack não
 * anima nada, a tela de produto continua viva por baixo, e a peça é a única
 * coisa em movimento.
 *
 * `onClose` é chamado DEPOIS da animação de fechamento: aqui só entra a
 * navegação, sem lógica de animação.
 *
 * ── Chrome do sistema ──────────────────────────────────────────────────────
 *  • Status bar: `light` e VISÍVEL — o story é full bleed e desenha por baixo
 *    dela; o chrome respeita `insets.top`. A tela de produto premium já está em
 *    `light`, então nada troca no meio da transição.
 *  • Tab bar: não existe nesta rota (push da Stack raiz, fora de `(tabs)`).
 */
export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wine = findWine(id ?? '');

  return (
    <>
      <StatusBar style="light" animated />
      <SommelierStory wine={wine} onClose={() => router.back()} />
    </>
  );
}
