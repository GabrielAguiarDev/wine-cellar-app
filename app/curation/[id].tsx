import { useCallback, useEffect, useState } from 'react';

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  Box,
  CurationBlock,
  FULLSCREEN_PADDING,
  Text,
} from '@components/index';
import {
  WineBackdrop,
  WineCarousel,
  useCarouselProgress,
} from '@components/organisms/wine-carousel';
import { findCuration, winesByIds } from '@data/index';

/** Deslocamento do carrossel ao entrar (sobe até a posição final). */
const ENTER_OFFSET = 20;

/**
 * Tela de destino da curadoria — o "dentro" do card da Home.
 *
 * O fundo bordô NÃO é recriado aqui: é o próprio `<CurationBlock
 * variant="fullscreen" />`, a mesma peça renderizada como card na Home
 * (`app/(tabs)/home/index.tsx`). Card e tela cheia compartilham componente,
 * cores e textos (vindos de `CURATIONS`) e o mesmo `transitionId` — é isso
 * que faz a shared element transition funcionar sem duplicar estilo.
 *
 * A ANIMAÇÃO DE ENTRADA vive dentro do `CurationBlock`: ele lê o retângulo do
 * card (medido no toque e guardado em `useTransitionStore`) e cresce dali até a
 * tela inteira; o conteúdo entra em fade depois. Esta rota só precisa estar
 * declarada como `transparentModal` + `animation: 'none'` em `app/_layout.tsx`
 * para a Stack não animar por cima e a Home continuar visível por baixo.
 * `onBack` é chamado DEPOIS da animação de fechamento — por isso passamos
 * apenas `router.back()`, sem lógica de animação aqui.
 *
 * A COLEÇÃO é um carrossel horizontal com snap (um vinho por vez) e um fundo
 * que assume a tonalidade do vinho em foco. Os dois compartilham o mesmo
 * `progress` criado aqui — esta tela é o ponto de composição:
 *   • `WineBackdrop` entra como `extraBackground`, ou seja DENTRO da forma,
 *     para ser recortado por ela e não pintar fora do bloco durante a transição.
 *   • `WineCarousel` entra como conteúdo, ocupando o espaço restante.
 *   • Os dois só montam quando a transição de entrada termina
 *     (`onOpenComplete`) — ver o comentário de `ready` abaixo.
 *
 * `buttonLabel` é passado mesmo esta tela não tendo CTA: em `fullscreen` ele
 * alimenta só o botão fantasma da transição (o CTA é o único elemento do card
 * sem par aqui, então sai em fade em vez de sumir de um frame para o outro).
 *
 * ── Chrome do sistema neste estado (decidido; ver também CurationBlock) ─────
 *  • Status bar: `light` (ícones claros sobre o bordô), visível, com o bloco
 *    desenhando por baixo dela. Na animação, trocar o estilo no INÍCIO da
 *    transição (`animated`), não ao final.
 *  • Tab bar: escondida. Esta rota é um push da Stack raiz (fora de
 *    `app/(tabs)/`), então some sozinha nos dois SOs — iOS não monta as
 *    Native Tabs aqui e a `TabBar` custom do Android só aparece nas 5 rotas
 *    de aba. Não reintroduzir a tab bar sobre este bloco.
 *  • Por isso o padding inferior é o inset de home indicator (aplicado dentro
 *    do CurationBlock), e não o `s108` das telas de aba.
 */
export default function CurationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const curation = findCuration(id);
  const progress = useCarouselProgress();
  /**
   * O conteúdo pesado (5 garrafas + 5 camadas de tinta) só monta DEPOIS da
   * animação de entrada. Criar essas views durante a transição custava um
   * stall de ~55ms na thread JS já no simulador — em aparelho fraco isso é
   * meia dúzia de frames perdidos justo no começo do movimento.
   */
  const [ready, setReady] = useState(false);
  const releaseContent = useCallback(() => setReady(true), []);

  /**
   * Entrada da coleção. Sem isso a tinta e o carrossel apareciam prontos, em
   * opacidade cheia, no frame em que montam — a transição terminava macia e o
   * conteúdo chegava seco. A tinta só faz fade (é fundo); o carrossel sobe
   * alguns pixels enquanto aparece.
   */
  const enter = useSharedValue(0);
  useEffect(() => {
    if (ready) {
      enter.set(
        withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [ready, enter]);

  const backdropEnterStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
  }));

  const carouselEnterStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: [
      { translateY: interpolate(enter.get(), [0, 1], [ENTER_OFFSET, 0]) },
    ],
  }));

  if (!curation) {
    return <Redirect href="/home" />;
  }

  const wines = winesByIds(curation.wineIds);
  const openWine = (wineId: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id: wineId } });

  return (
    <>
      <StatusBar style="light" />
      <CurationBlock
        variant="fullscreen"
        transitionId={curation.id}
        eyebrow={curation.eyebrow}
        title={curation.title}
        subtitle={curation.subtitle}
        buttonLabel={curation.buttonLabel}
        colors={curation.colors}
        onBack={() => router.back()}
        onOpenComplete={releaseContent}
        extraBackground={
          ready ? (
            <Animated.View style={[{ flex: 1 }, backdropEnterStyle]}>
              <WineBackdrop wines={wines} progress={progress} />
            </Animated.View>
          ) : null
        }>
        {/* Conteúdo específico da tela de destino. Fica dentro da camada de
            conteúdo do bloco (a que faz fade), nunca dentro da forma. */}
        <Box flex={1} marginTop="s26">
          <Text variant="eyebrow" color="cremeA55" marginBottom="s16">
            {wines.length} rótulos na coleção
          </Text>
          {/* O carrossel sangra até as bordas: o recuo lateral dele é o que
              centraliza os slides, então anulo o padding do bloco aqui. */}
          <Box flex={1} style={{ marginHorizontal: -FULLSCREEN_PADDING }}>
            {ready && (
              <Animated.View style={[{ flex: 1 }, carouselEnterStyle]}>
                <WineCarousel
                  wines={wines}
                  progress={progress}
                  onSelect={openWine}
                />
              </Animated.View>
            )}
          </Box>
        </Box>
      </CurationBlock>
    </>
  );
}
