/** Fração da largura da tela ocupada pelo slide central. */
export const FRACAO_LARGURA_ITEM = 0.64;

/** Respiro entre slides. */
export const ESPACAMENTO = 16;

/** Altura reservada para a legenda (tipo · uva, nome e preço) sob a moldura. */
export const ALTURA_LEGENDA = 104;

/** Folga entre a garrafa e a borda da moldura. */
export const RESPIRO_MOLDURA = 44;

/** Deslocamento vertical do slide vizinho (dá profundidade). */
export const DESLOCAMENTO_VIZINHO = 34;

/** Escala do slide vizinho. */
export const ESCALA_VIZINHO = 0.84;

/** Opacidade do slide vizinho. */
export const OPACIDADE_VIZINHO = 0.45;

/** Rotação (graus) do slide ao sair do centro — leve, só para dar volume. */
export const ROTACAO_VIZINHO = 7;

/**
 * Fração da altura da tela coberta pela tinta, ancorada embaixo. O topo do
 * gradiente era transparente de qualquer forma (o título fica lá), então
 * cobrir a tela inteira só custava pixels compostos à toa — e composição de
 * várias camadas em tela cheia é justamente o que pesa em GPU fraca.
 */
export const FRACAO_ALTURA_TINTA = 0.66;

/**
 * Alpha máximo da tinta de fundo, antes da correção por luminância. Mantido
 * baixo de propósito: o fundo bordô continua sendo o dono da tela, a cor do
 * vinho só "sugere" a tonalidade.
 */
export const ALPHA_TINTA = 0.5;

/**
 * Quanto a luminância da cor reduz o alpha. Vinhos claros (branco, espumante)
 * clareariam demais o bordô com o mesmo alpha de um tinto escuro — este fator
 * derruba a intensidade proporcionalmente ao brilho da cor.
 */
export const CORRECAO_LUMINANCIA = 0.72;
