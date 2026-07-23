import { type ReviewsMap } from './types';

/** Avaliações por vinho — idênticas ao protótipo (`this.reviews`). */
export const REVIEWS: ReviewsMap = {
  'notte-eterna': [
    {
      nome: 'Marina C.',
      nota: 5,
      comentario:
        'Simplesmente inesquecível. Abri num jantar especial e foi o centro das atenções.',
    },
    {
      nome: 'Rafael T.',
      nota: 5,
      comentario: 'Aveludado como prometido. Vale cada centavo.',
    },
    {
      nome: 'Beatriz L.',
      nota: 4,
      comentario: 'Ótimo tinto, precisa de um bom tempo de decantação.',
    },
    { nome: 'J. P.', nota: 5, comentario: '' },
  ],
  'perla-nera': [
    {
      nome: 'Camila R.',
      nota: 5,
      comentario: 'O melhor espumante que já provei. Perlage impecável.',
    },
    {
      nome: 'Otávio M.',
      nota: 5,
      comentario: 'Elegante e complexo. Guardo para ocasiões que merecem.',
    },
  ],
  'corona-reale': [
    {
      nome: 'Henrique A.',
      nota: 5,
      comentario: 'Um Bordeaux de outra era. Estrutura perfeita.',
    },
    { nome: 'Lúcia F.', nota: 4, comentario: 'Imponente. Pede pratos à altura.' },
  ],
  'lumiere-blanche': [
    { nome: 'Sofia D.', nota: 5, comentario: 'Cremoso e mineral, adorei com peixe.' },
  ],
};
