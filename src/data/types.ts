export type WineTipo = 'Tinto' | 'Branco' | 'Rosé' | 'Espumante';

export interface Wine {
  id: string;
  nome: string;
  safra: number;
  tipo: WineTipo;
  uva: string;
  regiao: string;
  assinatura: string;
  preco: number; // BRL, inteiro
  destaque: boolean; // true = produto premium (vídeo + reserva)
  notaMedia: number;
  totalAvaliacoes: number;
  estoqueBaixo: boolean;
  harmonizacoes: string[];
  cor: string; // cor do vidro da garrafa (hex)
  iniciais: string;
  videoDur?: string; // só destaques
}

export interface Review {
  nome: string;
  nota: number; // 1..5
  comentario: string; // pode ser ''
}

export type ReviewsMap = Record<string, Review[]>;

export type QuizKey = 'estilo' | 'corpo' | 'momento';

export interface QuizOption {
  label: string;
  hint: string;
  val: string;
}

export interface QuizQuestion {
  key: QuizKey;
  pergunta: string;
  desc: string;
  opcoes: QuizOption[];
}

export interface Ocasiao {
  key: string;
  label: string;
  desc: string;
  ids: string[]; // ids de vinhos recomendados
}
