import { type SharedValue } from 'react-native-reanimated';

import { type Wine } from '@data/types';

/**
 * Progresso do scroll em "unidades de item": 0 = primeiro item centralizado,
 * 1.5 = a meio caminho entre o segundo e o terceiro. É normalizado dentro do
 * handler de scroll (offset ÷ intervalo), então quem consome não precisa saber
 * largura nem espaçamento — só comparar com o próprio índice.
 */
export type CarouselProgress = SharedValue<number>;

export type WineCarouselProps = {
  wines: Wine[];
  /** Criado por quem compõe a tela e compartilhado com o `WineBackdrop`. */
  progress: CarouselProgress;
  onSelect: (id: string) => void;
};

export type WineBackdropProps = {
  wines: Wine[];
  /** O MESMO shared value passado ao carrossel. */
  progress: CarouselProgress;
};

export type WineSlideProps = {
  wine: Wine;
  index: number;
  progress: CarouselProgress;
  width: number;
  height: number;
  onPress: () => void;
};
