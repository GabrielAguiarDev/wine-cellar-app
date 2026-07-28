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
