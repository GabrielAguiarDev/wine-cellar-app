import { Easing } from 'react-native-reanimated';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Medidas e tempos do story do sommelier
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Fração da JANELA que o preview ocupa — largura E altura.
 *
 * É o número mais importante deste arquivo: como a mesma fração vale para os
 * dois eixos, o preview é uma MINIATURA EXATA do story (mesma proporção da
 * tela, não um 9:16 fixo), e a transição inteira é uma escala uniforme de
 * `PREVIEW_FRACTION` até 1. Com um retângulo de proporção diferente da tela, a
 * expansão precisaria esticar os dois eixos em ritmos distintos e a garrafa
 * deformaria no meio do caminho.
 *
 * 0.36 é o teto prático: o preview antigo (deitado) tinha 196 de altura, e um
 * formato vertical custa altura de qualquer maneira — acima disso ele empurra
 * "Harmoniza com" para fora da primeira rolagem e deixa de sobrar largura para
 * a coluna de texto ao lado.
 */
export const PREVIEW_FRACTION = 0.36;

/** Raio do preview. Vai a 0 quando o story ocupa a tela. */
export const PREVIEW_RADIUS = 14;

/**
 * Expansão e fechamento. Mais curtos que os do `CurationBlock` (560/420): lá a
 * forma já nasce com ~89% da largura da tela e só cresce na vertical; aqui ela
 * parte de 40% nos dois eixos, então o mesmo tempo lê como lentidão.
 */
export const OPEN_DURATION = 460;
export const CLOSE_DURATION = 340;

/** Curva "emphasized" — a mesma do `CurationBlock`, por coerência de sistema. */
export const CURVE = Easing.bezier(0.4, 0, 0.2, 1);

/** A partir de que ponto da expansão o chrome do player aparece. */
export const CHROME_FADE_START = 0.5;

/**
 * Até que ponto a etiqueta de duração do preview (o único elemento sem par no
 * player) fica visível. Sem esse fade ela desapareceria de um frame para o
 * outro, quando a forma opaca nasce por cima do preview.
 */
export const GHOST_FADE_END = 0.24;

/** Opacidade do scrim que escurece a tela de produto atrás do story. */
export const SCRIM_OPACITY = 0.62;

/* ── Quadro do vídeo ────────────────────────────────────────────────────── */

/**
 * Largura da garrafa no story em tela cheia. Todas as medidas internas do
 * quadro são multiplicadas pela escala que quem monta passa, então o preview é
 * o mesmo quadro × `PREVIEW_FRACTION`.
 */
export const FIGURE_BOTTLE_WIDTH = 150;

/**
 * Espaço reservado na base do quadro, onde vive a legenda do trecho. Centrada
 * no quadro inteiro, a garrafa encostava nela; como é padding (e não
 * `translateY`), o `transform` da garrafa fica livre para o movimento de vídeo
 * — dois estilos disputando `transform` no mesmo nó, e o último sobrescreve o
 * outro por inteiro.
 *
 * A garrafa sobe METADE deste valor: o padding só reduz a área em que ela se
 * centraliza.
 */
export const FIGURE_BOTTOM_ROOM = 68;

/** Altura do véu escuro no topo do quadro (legibilidade do chrome). */
export const TOP_SCRIM_HEIGHT = 190;

/** Altura do véu escuro na base (legibilidade da legenda). */
export const BOTTOM_SCRIM_HEIGHT = 300;

/* ── "Vídeo" (Ken Burns) ────────────────────────────────────────────────── */

/**
 * Quanto a garrafa cresce ao longo de UM trecho, e quanto ela desliza.
 *
 * Não há arquivo de vídeo no app: o que faz o quadro parecer filmado é este
 * movimento contínuo e lento, com a direção alternando a cada trecho — parado,
 * o mesmo quadro leria como uma foto com uma barra de progresso em cima.
 * Ambos são derivados do MESMO progresso do trecho, então pausar o story pausa
 * a imagem junto, como num vídeo de verdade.
 */
export const KEN_BURNS_SCALE = 0.08;
export const KEN_BURNS_SHIFT = 12;

/* ── Barra de progresso (padrão Instagram) ──────────────────────────────── */

export const SEGMENT_HEIGHT = 2.5;

/** Respiro entre segmentos. */
export const SEGMENT_GAP = 4;

/* ── Toques e gestos ────────────────────────────────────────────────────── */

/**
 * Fração da largura, à esquerda, que volta um trecho. O resto avança — a
 * assimetria do Instagram: avançar é o gesto frequente, então fica com a área
 * maior e sob o polegar.
 */
export const BACK_ZONE_FRACTION = 0.3;

/** Tempo de dedo parado que PAUSA o story (segurar para olhar). */
export const HOLD_MIN_DURATION = 200;

/** Fade do chrome ao segurar — ele sai da frente da imagem enquanto pausada. */
export const HOLD_FADE_DURATION = 160;

/**
 * Distância máxima (pt) que o dedo pode andar sem invalidar um toque de
 * avançar/voltar. Fica abaixo do `activeOffsetY` do arrasto, então nunca há um
 * instante em que os dois valham ao mesmo tempo. Ver `CurationBlock`.
 */
export const TAP_MAX_DISTANCE = 12;

/** Deslocamento a partir do qual soltar FECHA em vez de voltar ao lugar. */
export const DISMISS_DISTANCE = 110;

/** Atalho por velocidade: um flick curto para baixo também fecha. */
export const DISMISS_VELOCITY = 900;

/** Onde o encolhimento do arrasto chega ao mínimo (fração da altura da tela). */
export const DRAG_RANGE_FRACTION = 0.55;

/** Escala mínima do bloco no fim do arrasto. */
export const DRAG_SCALE_MIN = 0.9;

/** Raio ganho ao arrastar (0 em repouso: em tela cheia não há canto). */
export const DRAG_RADIUS = 26;

/** Volta ao lugar sem overshoot — o bloco cobre a tela inteira. */
export const DRAG_SPRING = {
  damping: 26,
  stiffness: 260,
  mass: 0.9,
  overshootClamping: true,
} as const;

/** Saída pela borda de baixo, usada só quando não há preview de origem. */
export const MODAL_EXIT_DURATION = 300;
