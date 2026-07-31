import { StyleSheet } from 'react-native';

import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { type SommelierChapter } from '@data/types';
import { palette } from '@theme/index';

import { Box } from '../../Box';
import { SEGMENT_GAP, SEGMENT_HEIGHT } from './conf';

type SegmentState = 'done' | 'active' | 'todo';

/**
 * Um segmento. O preenchimento é `scaleX` a partir da borda esquerda — animar
 * `width` obrigaria a remedir a linha a cada frame do vídeo.
 */
function Segment({
  state,
  fill,
  weight,
}: {
  state: SegmentState;
  fill: SharedValue<number>;
  weight: number;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { scaleX: state === 'done' ? 1 : state === 'active' ? fill.get() : 0 },
    ],
  }));

  return (
    <Box
      flex={weight}
      height={SEGMENT_HEIGHT}
      borderRadius="rFull"
      backgroundColor="cremeA25"
      style={{ overflow: 'hidden' }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: palette.creme,
            transformOrigin: 'left',
          },
          style,
        ]}
      />
    </Box>
  );
}

/**
 * Barra de progresso do story — o padrão do Instagram: um segmento por trecho,
 * os já vistos cheios, o atual enchendo em tempo real, os seguintes vazios.
 *
 * A LARGURA de cada segmento é proporcional à duração do trecho (`flex` =
 * segundos), e não igual para todos como no Instagram: ali cada segmento é um
 * post independente, aqui é UM vídeo repartido — com segmentos iguais, um
 * trecho de 14s andaria visivelmente mais devagar que um de 11s e a barra
 * mentiria sobre o quanto falta.
 *
 * Um único shared value (`fill`, 0→1 do trecho atual) alimenta a barra inteira:
 * é o mesmo relógio que move a imagem, então pausar pausa os dois juntos.
 */
export function StoryProgressBar({
  chapters,
  index,
  fill,
}: {
  chapters: SommelierChapter[];
  index: number;
  fill: SharedValue<number>;
}) {
  return (
    <Box flexDirection="row" alignItems="center" style={{ gap: SEGMENT_GAP }}>
      {chapters.map((chapter, i) => (
        <Segment
          key={i}
          weight={chapter.seconds}
          fill={fill}
          state={i < index ? 'done' : i === index ? 'active' : 'todo'}
        />
      ))}
    </Box>
  );
}
