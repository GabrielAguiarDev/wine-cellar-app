import { type SommelierChapter, type Wine } from './types';

/**
 * Roteiro do vídeo do sommelier, trecho por trecho.
 *
 * Cada trecho é um SEGMENTO da barra de progresso do story — é por isso que o
 * vídeo é dado assim, e não como um arquivo único com uma legenda só: a barra
 * do Instagram precisa saber onde um pedaço termina e o outro começa, e é o que
 * permite tocar para avançar/voltar dentro do mesmo vídeo.
 *
 * A soma dos `seconds` de cada roteiro é o `videoDuration` do vinho no
 * catálogo (`wines.ts`) — ver o teste em `__tests__/sommelierStories.test.ts`.
 * Ao mexer num roteiro, ajuste os dois lados.
 */
const STORIES: Record<string, SommelierChapter[]> = {
  'notte-eterna': [
    {
      seconds: 12,
      cue: 'Origem',
      caption:
        'Nebbiolo das encostas altas do Piemonte, onde a neblina de outubro adia a colheita.',
    },
    {
      seconds: 14,
      cue: 'Na taça',
      caption:
        'Rubi profundo, quase opaco. Deixe respirar vinte minutos antes do primeiro gole.',
    },
    {
      seconds: 11,
      cue: 'No nariz',
      caption: 'Frutas negras, violeta seca e um fundo de couro nobre.',
    },
    {
      seconds: 11,
      cue: 'À mesa',
      caption:
        'Peça uma carne de longa cocção. O tanino aveludado limpa a boca e pede o próximo garfo.',
    },
  ],
  'perla-nera': [
    {
      seconds: 12,
      cue: 'Origem',
      caption:
        'Franciacorta, Lombardia — método tradicional, trinta meses sobre as próprias leveduras.',
    },
    {
      seconds: 14,
      cue: 'Na taça',
      caption:
        'Perlage fino e teimoso: a borbulha sobe em fio, sem pressa, por minutos.',
    },
    {
      seconds: 14,
      cue: 'No nariz',
      caption: 'Brioche recém-saído do forno, amêndoa fresca e casca de limão.',
    },
    {
      seconds: 12,
      cue: 'À mesa',
      caption:
        'Ostras, um risoto de limão siciliano — ou nada além do brinde. Sirva a 8 °C.',
    },
  ],
  'corona-reale': [
    {
      seconds: 13,
      cue: 'Origem',
      caption:
        'Cabernet Sauvignon de Bordeaux, safra 2016 — uma das grandes da margem esquerda.',
    },
    {
      seconds: 14,
      cue: 'Na taça',
      caption:
        'Granada de bordas escuras. Lágrima lenta no cristal: sinal da estrutura que vem.',
    },
    {
      seconds: 13,
      cue: 'No nariz',
      caption: 'Cassis, cedro, grafite e um sopro de tabaco fino.',
    },
    {
      seconds: 12,
      cue: 'Na boca',
      caption:
        'Taninos nobres, ainda firmes, e um final que se estende por mais de um minuto.',
    },
    {
      seconds: 13,
      cue: 'À mesa',
      caption:
        'Cordeiro ao forno. Decante por uma hora — este rótulo tem outros dez anos de vida.',
    },
  ],
};

/** Duração de cada trecho do roteiro genérico, em segundos. */
const FALLBACK_SECONDS = 12;

/**
 * Roteiro montado a partir da própria ficha do vinho. Existe para que QUALQUER
 * rótulo que vire destaque tenha story — sem isso, marcar `featured: true` num
 * vinho novo abriria uma tela vazia até alguém escrever o roteiro à mão.
 */
function fallbackStory(wine: Wine): SommelierChapter[] {
  return [
    {
      seconds: FALLBACK_SECONDS,
      cue: 'Origem',
      caption: `${wine.grape} de ${wine.region}, safra ${wine.vintage}.`,
    },
    {
      seconds: FALLBACK_SECONDS,
      cue: 'Na taça',
      caption: wine.signature,
    },
    {
      seconds: FALLBACK_SECONDS,
      cue: 'À mesa',
      caption: `Harmoniza com ${wine.pairings.join(', ')}.`,
    },
  ];
}

/** O roteiro do vinho — o escrito à mão, ou o derivado da ficha. */
export function sommelierStory(wine: Wine): SommelierChapter[] {
  return STORIES[wine.id] ?? fallbackStory(wine);
}

/** Duração total do roteiro, em segundos. */
export function storySeconds(chapters: SommelierChapter[]): number {
  return chapters.reduce((total, chapter) => total + chapter.seconds, 0);
}
