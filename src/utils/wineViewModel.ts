import { type WineCardData, type WineRowData } from '@components/index';
import { type Wine } from '@data/types';
import { palette } from '@theme/index';

import { brl, nf } from './format';

const DARK_CAP = '#2A1C12';

/** Cor da cápsula: dourada para destaques, escura para os demais. */
export function capColorFor(wine: Wine): string {
  return wine.featured ? palette.gold : DARK_CAP;
}

/** "Tinto · Nebbiolo" */
export function typeAndGrape(wine: Wine): string {
  return `${wine.type} · ${wine.grape}`;
}

/** "Tinto · Nebbiolo · Piemonte" */
export function fullCategory(wine: Wine): string {
  return `${wine.type} · ${wine.grape} · ${wine.region}`;
}

/** Mapeia um `Wine` para as props do `WineCard`. */
export function toWineCardData(wine: Wine, favorite = false): WineCardData {
  return {
    name: wine.name,
    category: typeAndGrape(wine),
    priceFmt: brl(wine.price),
    ratingFmt: nf(wine.averageRating),
    color: wine.color,
    capColor: capColorFor(wine),
    initials: wine.initials,
    featured: wine.featured,
    favorite,
  };
}

type WineRowOptions = {
  /** Usa a categoria completa (tipo · uva · região) em vez de tipo · uva. */
  full?: boolean;
  /** Inclui o preço formatado à direita. Default true. */
  withPrice?: boolean;
};

/** Mapeia um `Wine` para as props do `WineRow`. */
export function toWineRowData(
  wine: Wine,
  { full = false, withPrice = true }: WineRowOptions = {},
): WineRowData {
  return {
    name: wine.name,
    category: full ? fullCategory(wine) : typeAndGrape(wine),
    priceFmt: withPrice ? brl(wine.price) : undefined,
    color: wine.color,
    capColor: capColorFor(wine),
    initials: wine.initials,
  };
}
