import { useCallback, useRef } from 'react';

import { useWindowDimensions, View } from 'react-native';

import { sommelierStory, storySeconds } from '@data/sommelierStories';
import { useTransitionStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { mmss } from '@utils/format';
import { measureNode } from '@utils/measure';

import { Box, TouchableOpacityBox } from '../../Box';
import { Icon } from '../../Icon';
import { Text } from '../../Text';
import { PREVIEW_FRACTION, PREVIEW_RADIUS } from './conf';
import { StoryFrame } from './StoryFrame';
import { type SommelierStoryPreviewProps } from './types';

/**
 * Chave do shared element. A MESMA no preview e no player — é ela que casa
 * origem e destino em `useTransitionStore`.
 */
export function storyTransitionId(wineId: string): string {
  return `sommelier-story:${wineId}`;
}

/** Folga entre a miniatura e o anel dourado em volta dela (padding `s4`). */
const RING_GAP = 4;

/**
 * Etiqueta "▶ 0:48" do canto do preview. Exportada porque o player renderiza
 * uma CÓPIA dela durante a expansão — é o único elemento do preview sem par no
 * story em tela cheia, então em vez de desaparecer de um frame para o outro ele
 * é reproduzido no destino e sai em fade. Ver `GHOST_FADE_END`.
 */
export function StoryDurationBadge({ duration }: { duration: string }) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      backgroundColor="wineA70"
      borderWidth={1}
      borderColor="goldA35"
      borderRadius="rFull"
      paddingVertical="s4"
      paddingHorizontal="s8"
      style={{ gap: 6 }}>
      <Icon name="play" size={7} color={palette.gold} />
      <Text
        variant="label"
        fontSize={8.5}
        color="cremeA82"
        style={{ letterSpacing: 1 }}>
        {duration}
      </Text>
    </Box>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SommelierStoryPreview — o vídeo do sommelier como um story ainda fechado
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Era um retângulo deitado de 196 de altura com um ▶ no meio, ou seja um player
 * de vídeo horizontal no meio de uma tela vertical. Agora é uma MINIATURA da
 * tela do story: mesma proporção da janela, o mesmo quadro que vai crescer, e o
 * anel dourado em volta — o vocabulário de "há um story aqui".
 *
 * ── Por que a miniatura tem a proporção da JANELA ───────────────────────────
 *
 * Largura e altura saem da mesma fração (`PREVIEW_FRACTION`), então o preview é
 * o story em escala reduzida, não um retângulo de proporção própria. É o que
 * permite ao player animar UMA escala uniforme de 40% a 100%: com proporções
 * diferentes, os dois eixos cresceriam em ritmos distintos e a garrafa
 * deformaria no caminho.
 *
 * ── Medir antes de navegar ──────────────────────────────────────────────────
 *
 * No toque, mede a MINIATURA (a forma) e a etiqueta de duração, grava as duas
 * em `useTransitionStore` e só então chama `onOpen`. Sem a medida gravada o
 * story aparece de salto, já em tela cheia (é também o que acontece num deep
 * link, onde não existe preview nenhum na tela).
 *
 * `TouchableOpacityBox` e não `PressableScale`: opacidade não muda geometria.
 * Um toque que ENCOLHE o alvo mexeria justamente no retângulo que estamos
 * medindo, e a expansão partiria de uma forma 4% menor que a real.
 */
export function SommelierStoryPreview({
  wine,
  onOpen,
}: SommelierStoryPreviewProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const setSource = useTransitionStore(s => s.setSource);

  const shapeRef = useRef<View | null>(null);
  const badgeRef = useRef<View | null>(null);

  const width = Math.round(screenWidth * PREVIEW_FRACTION);
  const height = Math.round(screenHeight * PREVIEW_FRACTION);

  const chapters = sommelierStory(wine);
  const duration = wine.videoDuration ?? mmss(storySeconds(chapters));

  const open = useCallback(() => {
    const node = shapeRef.current;
    if (!node) {
      onOpen();
      return;
    }
    Promise.all([measureNode(node), measureNode(badgeRef.current)]).then(
      ([shape, badge]) => {
        if (shape && shape.width > 0 && shape.height > 0) {
          setSource(storyTransitionId(wine.id), {
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            radius: PREVIEW_RADIUS,
            button: badge && { x: badge.x, y: badge.y },
          });
        }
        onOpen();
      },
    );
  }, [onOpen, setSource, wine.id]);

  return (
    <TouchableOpacityBox
      activeOpacity={0.92}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Assistir ao story do sommelier sobre ${wine.name}, ${duration}`}
      flexDirection="row"
      alignItems="center"
      style={{ gap: 18 }}>
      {/* Anel dourado: a moldura fica FORA da forma medida, então ela não
          participa da transição — o story sai de dentro dela. */}
      <Box
        padding="s4"
        borderWidth={1}
        borderColor="goldA55"
        style={{ borderRadius: PREVIEW_RADIUS + RING_GAP + 1 }}>
        <View
          ref={shapeRef}
          nativeID={storyTransitionId(wine.id)}
          testID={storyTransitionId(wine.id)}
          // O Android achata Views sem conteúdo próprio, e aí o
          // `measureInWindow` devolve o nó errado.
          collapsable={false}
          style={{ borderRadius: PREVIEW_RADIUS, overflow: 'hidden' }}>
          <StoryFrame
            wine={wine}
            width={width}
            height={height}
            scale={PREVIEW_FRACTION}
          />

          {/* Etiqueta de duração — o único elemento do preview sem par no
              player, e por isso o que sai em fade lá (ver `GHOST_FADE_END`).
              O `View` externo existe para poder ser medido: é o canto dele que
              ancora a cópia fantasma durante a expansão. */}
          <View
            ref={badgeRef}
            collapsable={false}
            style={{ position: 'absolute', left: 10, bottom: 10 }}>
            <StoryDurationBadge duration={duration} />
          </View>
        </View>
      </Box>

      <Box flex={1}>
        <Text
          color="textOnDark"
          style={{
            fontFamily: fonts.serifSemiBold,
            fontSize: 25,
            lineHeight: 27,
          }}>
          Conheça o {wine.name}
        </Text>
        <Text variant="body" fontSize={11.5} color="cremeA62" marginTop="s10">
          {chapters.length} trechos narrados pelo nosso sommelier.
        </Text>
        <Text
          variant="label"
          fontSize={8.5}
          color="accent"
          marginTop="s16"
          style={{ letterSpacing: 1.8 }}>
          Toque para assistir
        </Text>
      </Box>
    </TouchableOpacityBox>
  );
}
