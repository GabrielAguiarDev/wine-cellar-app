export type WineType = 'Tinto' | 'Branco' | 'Rosé' | 'Espumante';

/** Corpo do vinho — filtro "Corpo" da busca. */
export type WineBody = 'Leve' | 'Médio' | 'Encorpado';

export interface Wine {
  id: string;
  name: string;
  vintage: number;
  type: WineType;
  body: WineBody;
  grape: string;
  region: string;
  signature: string;
  price: number; // BRL, inteiro
  featured: boolean; // true = produto premium (vídeo + reserva)
  averageRating: number;
  reviewCount: number;
  lowStock: boolean;
  pairings: string[];
  color: string; // cor do vidro da garrafa (hex)
  initials: string;
  videoDuration?: string; // só destaques
}

/**
 * Um trecho do vídeo do sommelier — e, na tela, UM segmento da barra de
 * progresso do story (a barra do Instagram tem um segmento por trecho).
 *
 * A soma dos `seconds` de um vinho é exatamente o `videoDuration` dele; há um
 * teste guardando isso (`src/data/__tests__/sommelierStories.test.ts`), porque
 * é a única coisa que liga o roteiro à duração exibida no preview.
 */
export interface SommelierChapter {
  /** Duração do trecho, em segundos. */
  seconds: number;
  /** Etiqueta curta do trecho, em caixa alta na tela. Ex.: "Na taça". */
  cue: string;
  /** A fala do sommelier naquele trecho — a legenda do story. */
  caption: string;
}

export interface Review {
  name: string;
  rating: number; // 1..5
  comment: string; // pode ser ''
}

export type ReviewsMap = Record<string, Review[]>;

export type QuizKey = 'style' | 'body' | 'moment';

export interface QuizOption {
  label: string;
  hint: string;
  val: string;
}

export interface QuizQuestion {
  key: QuizKey;
  question: string;
  desc: string;
  options: QuizOption[];
}

export interface Occasion {
  key: string;
  label: string;
  desc: string;
  ids: string[]; // ids de vinhos recomendados
}
