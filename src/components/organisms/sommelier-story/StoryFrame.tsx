import { StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';

import { palette } from '@theme/index';

import { BottleGraphic } from '../../BottleGraphic';
import { Box } from '../../Box';
import {
  BOTTOM_SCRIM_HEIGHT,
  FIGURE_BOTTLE_WIDTH,
  FIGURE_BOTTOM_ROOM,
  TOP_SCRIM_HEIGHT,
} from './conf';
import { type StoryFrameProps } from './types';

/** `#RRGGBB` + alpha → `rgba(...)`. */
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * Fundo do quadro: o ESCURO do vídeo (`palette.wineDark2`, o token que já se
 * chamava "fundo do vídeo do sommelier"), não o bordô das telas.
 *
 * A diferença não é decorativa. Com o mesmo bordô da tela de produto, o gargalo
 * da garrafa — que é `wine.color`, quase a mesma cor — desaparecia no fundo, e a
 * cápsula dourada flutuava solta no ar. Sobre o escuro, o vidro lê como vidro, o
 * dourado brilha e o rótulo creme acende. É também o que faz a miniatura se
 * destacar como "há um vídeo aqui" em vez de virar mais um bloco bordô.
 */
const BACKDROP = [palette.wineDeep, palette.wineDark2] as const;
const BACKDROP_START = { x: 0.85, y: 0 };
const BACKDROP_END = { x: 0.15, y: 1 };

/**
 * Foco de luz quente no eixo central, onde a garrafa está — o vinho num palco
 * escuro. É o que dá volume ao quadro sem clarear o fundo inteiro.
 */
const SPOT = ['transparent', rgba(palette.gold, 0.12), 'transparent'] as const;
const SPOT_START = { x: 0, y: 0.5 };
const SPOT_END = { x: 1, y: 0.5 };

const SCRIM_TOP = [rgba(palette.wineDark2, 0.5), 'transparent'] as const;
const SCRIM_BOTTOM = ['transparent', rgba(palette.wineDark2, 0.88)] as const;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * StoryFrame — O QUADRO DO VÍDEO, a imagem compartilhada pelos dois estados
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * O mesmo componente desenha o preview (miniatura, na tela de produto) e o
 * story em tela cheia. É o que torna a transição um shared element de verdade:
 * no primeiro frame da expansão a imagem que cresce é pixel a pixel a que
 * estava no preview.
 *
 * A única diferença entre os dois é `scale`, que multiplica TODAS as medidas
 * internas. Como o preview tem a proporção da janela (ver `PREVIEW_FRACTION`),
 * `scale` é o mesmo nos dois eixos e o player só precisa animar uma escala
 * uniforme de `PREVIEW_FRACTION` até 1.
 *
 * O que NÃO entra aqui: barra de progresso, nome, legenda, etiqueta de duração.
 * Esses são chrome — aparecem/somem em fade, cada um no seu estado, e nenhum
 * deles pode ser esticado enquanto a forma cresce.
 *
 * ── Onde o VÍDEO entra ──────────────────────────────────────────────────────
 *
 * No slot `media`. A garrafa desenhada é PLACEHOLDER — o catálogo é mock e não
 * há arquivo de vídeo no app ainda. Quando houver (`videoUrl` no `Wine` +
 * `expo-video`), o player passa um `<VideoView>` e o preview passa o poster;
 * nada mais muda, porque o quadro trata a mídia como um retângulo qualquer:
 *  • o `figureStyle` (movimento de câmera) continua servindo — com vídeo real
 *    ele deixa de ser necessário e pode virar `undefined`, já que a imagem
 *    passa a se mover sozinha;
 *  • o relógio do story (`fill`) passa a ser alimentado pelo tempo do vídeo em
 *    vez do `withTiming` por trecho (ver `StoryPlayer`).
 * A mídia é envolvida pelo mesmo nó centralizado da garrafa, então basta ela
 * ter medidas próprias (ex.: `width`/`height` do quadro) para sangrar.
 *
 * Custo por frame: os gradientes são invariantes à escala (é o que permite
 * esticá-los junto da forma sem a cor saltar) e a garrafa é o único nó que
 * carrega desenho. Nada aqui é remedido durante a transição — quem anima é a
 * forma, por fora.
 */
export function StoryFrame({
  wine,
  width,
  height,
  scale,
  media,
  figureStyle,
}: StoryFrameProps) {
  return (
    <Box width={width} height={height} style={{ overflow: 'hidden' }}>
      <LinearGradient
        colors={BACKDROP}
        start={BACKDROP_START}
        end={BACKDROP_END}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={SPOT}
        start={SPOT_START}
        end={SPOT_END}
        style={StyleSheet.absoluteFill}
      />
      {/* Tinta da cor do vidro, ancorada embaixo — a mesma ideia do
          `WineBackdrop` da curadoria: o fundo continua dono do quadro, a cor do
          vinho só sugere a tonalidade. */}
      <LinearGradient
        colors={['transparent', rgba(wine.color, 0.42)]}
        style={[StyleSheet.absoluteFill, { top: height * 0.35 }]}
      />

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: FIGURE_BOTTOM_ROOM * scale,
          },
          figureStyle,
        ]}>
        {media ?? (
          <BottleGraphic
            width={FIGURE_BOTTLE_WIDTH * scale}
            color={wine.color}
            initials={wine.initials}
            vintage={wine.vintage}
            premium
            labelMode="full"
          />
        )}
      </Animated.View>

      <LinearGradient
        colors={SCRIM_TOP}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: TOP_SCRIM_HEIGHT * scale,
        }}
      />
      <LinearGradient
        colors={SCRIM_BOTTOM}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: BOTTOM_SCRIM_HEIGHT * scale,
        }}
      />
    </Box>
  );
}
