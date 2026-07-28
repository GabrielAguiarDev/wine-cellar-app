export type WineType = 'Tinto' | 'Branco' | 'Rosé' | 'Espumante';

export interface Wine {
  id: string;
  name: string;
  vintage: number;
  type: WineType;
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
