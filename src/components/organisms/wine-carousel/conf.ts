/** Fração da largura da tela ocupada pelo slide central. */
export const ITEM_WIDTH_FRACTION = 0.64;

/** Respiro entre slides. */
export const SPACING = 16;

/** Altura reservada para a legenda (tipo · uva, nome e preço) sob a moldura. */
export const CAPTION_HEIGHT = 104;

/** Folga entre a garrafa e a borda da moldura. */
export const FRAME_INSET = 44;

/** Deslocamento vertical do slide vizinho (dá profundidade). */
export const NEIGHBOR_OFFSET = 34;

/** Escala do slide vizinho. */
export const NEIGHBOR_SCALE = 0.84;

/** Opacidade do slide vizinho. */
export const NEIGHBOR_OPACITY = 0.45;

/** Rotação (graus) do slide ao sair do centro — leve, só para dar volume. */
export const NEIGHBOR_ROTATION = 7;

/**
 * Fração da altura da tela coberta pela tinta, ancorada embaixo. O topo do
 * gradiente era transparente de qualquer forma (o título fica lá), então
 * cobrir a tela inteira só custava pixels compostos à toa — e composição de
 * várias camadas em tela cheia é justamente o que pesa em GPU fraca.
 */
export const TINT_HEIGHT_FRACTION = 0.66;

/**
 * Distância máxima (pt) que o dedo pode andar sem invalidar o toque no slide.
 *
 * Existe porque esta tela pode ser ARRASTADA para baixo para fechar (ver
 * `CurationBlock`) e o arrasto leva o bloco junto com o dedo: em coordenadas do
 * card, o dedo nunca sai de dentro dele, então um touchable de RN não cancela o
 * toque e soltar disparava duas ações (abrir o produto E fechar a curadoria).
 * Fica abaixo do `activeOffsetY(14)` do arrasto, para que o toque já tenha
 * falhado quando o gesto de fechar nasce — nunca há um ponto em que os dois
 * valham ao mesmo tempo.
 */
export const TAP_MAX_DISTANCE = 12;

/** Opacidade do slide enquanto está pressionado (era o `activeOpacity`). */
export const PRESS_OPACITY = 0.9;

/** Tempo para a opacidade de toque voltar ao normal ao soltar. */
export const PRESS_RELEASE_DURATION = 120;

/**
 * Alpha máximo da tinta de fundo, antes da correção por luminância. Mantido
 * baixo de propósito: o fundo bordô continua sendo o dono da tela, a cor do
 * vinho só "sugere" a tonalidade.
 */
export const TINT_ALPHA = 0.5;

/**
 * Quanto a luminância da cor reduz o alpha. Vinhos claros (branco, espumante)
 * clareariam demais o bordô com o mesmo alpha de um tinto escuro — este fator
 * derruba a intensidade proporcionalmente ao brilho da cor.
 */
export const LUMINANCE_CORRECTION = 0.72;
