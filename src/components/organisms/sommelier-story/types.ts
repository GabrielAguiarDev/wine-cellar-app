import { type ReactNode } from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import { type AnimatedStyle } from 'react-native-reanimated';

import { type Wine } from '@data/types';

export type StoryFrameProps = {
  wine: Wine;
  /**
   * A MÍDIA do quadro — é aqui que o vídeo do sommelier entra (um
   * `<VideoView>` no player, o poster/primeiro frame no preview).
   *
   * Sem ela, o quadro cai no placeholder: a garrafa desenhada. Todo o resto
   * (fundo, véus, foco de luz, movimento de câmera, barra, legendas) é
   * indiferente ao que ocupa este slot, então trocar o placeholder pelo vídeo
   * real não mexe na mecânica do story.
   */
  media?: ReactNode;
  /** Medidas do quadro. No player é a janela inteira; no preview, a miniatura. */
  width: number;
  height: number;
  /**
   * Escala das medidas INTERNAS (garrafa, véus, deslocamento). 1 = tela cheia.
   * O preview passa `PREVIEW_FRACTION`, e é isso que faz os dois quadros serem
   * a mesma imagem em tamanhos diferentes — requisito da transição.
   */
  scale: number;
  /** Estilo animado da garrafa (o movimento de "vídeo"). Só o player usa. */
  figureStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
};

export type SommelierStoryPreviewProps = {
  wine: Wine;
  /**
   * Abrir o story. É chamado DEPOIS de o preview medir a si mesmo — passe só a
   * navegação, sem lógica de animação.
   */
  onOpen: () => void;
};

export type SommelierStoryProps = {
  wine: Wine;
  /**
   * Fechar. É chamado DEPOIS de a animação de fechamento terminar — passe só a
   * navegação (`router.back()`).
   */
  onClose: () => void;
};
