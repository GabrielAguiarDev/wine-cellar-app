import { type ReviewsMap } from './types';

/** Avaliações por vinho — idênticas ao protótipo (`this.reviews`). */
export const REVIEWS: ReviewsMap = {
  'notte-eterna': [
    {
      name: 'Marina C.',
      rating: 5,
      comment:
        'Simplesmente inesquecível. Abri num jantar especial e foi o centro das atenções.',
    },
    {
      name: 'Rafael T.',
      rating: 5,
      comment: 'Aveludado como prometido. Vale cada centavo.',
    },
    {
      name: 'Beatriz L.',
      rating: 4,
      comment: 'Ótimo tinto, precisa de um bom tempo de decantação.',
    },
    { name: 'J. P.', rating: 5, comment: '' },
  ],
  'perla-nera': [
    {
      name: 'Camila R.',
      rating: 5,
      comment: 'O melhor espumante que já provei. Perlage impecável.',
    },
    {
      name: 'Otávio M.',
      rating: 5,
      comment: 'Elegante e complexo. Guardo para ocasiões que merecem.',
    },
  ],
  'corona-reale': [
    {
      name: 'Henrique A.',
      rating: 5,
      comment: 'Um Bordeaux de outra era. Estrutura perfeita.',
    },
    { name: 'Lúcia F.', rating: 4, comment: 'Imponente. Pede pratos à altura.' },
  ],
  'lumiere-blanche': [
    { name: 'Sofia D.', rating: 5, comment: 'Cremoso e mineral, adorei com peixe.' },
  ],
};
