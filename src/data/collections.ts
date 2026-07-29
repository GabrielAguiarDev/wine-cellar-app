/**
 * Coleções editoriais que NÃO são curadorias (`curations.ts`). A diferença é de
 * natureza: uma curadoria é uma seleção que muda (semana, ocasião) e tem rota
 * própria por `id`; a coleção reservada é permanente e definida por um atributo
 * do catálogo — os rótulos `featured`.
 *
 * O conteúdo vive aqui, e não na tela, pelo mesmo motivo de `CURATIONS`: o card
 * da Home e a tela `/reserved` mostram o MESMO eyebrow e o MESMO título. Com o
 * texto duplicado nos dois arquivos, um dia eles divergem.
 */
export const RESERVED_COLLECTION = {
  eyebrow: 'Coleção reservada',
  title: 'Vinhos raros & especiais',
  /** Chamada curta — cabe no card da Home. */
  teaser: 'Garrafas de edição limitada, com vídeo do sommelier.',
  /** Chamada longa — sobre a fotografia da adega, na tela. */
  lead: 'Rótulos de produção mínima, guardados na nossa adega e apresentados em vídeo pelo sommelier da casa.',
  /** Nota de fechamento da tela. */
  note: 'Cada garrafa desta coleção é reservada no ato do pedido e conferida uma a uma antes de sair da adega. Quando o rótulo acaba, ele não volta.',
  /** CTA do rodapé — leva ao sommelier virtual. */
  ctaLabel: 'Falar com o sommelier',
} as const;
