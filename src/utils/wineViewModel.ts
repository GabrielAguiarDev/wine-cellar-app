import { type WineCardData, type WineRowData } from '@components/index';
import { type Wine } from '@data/types';
import { palette } from '@theme/index';

import { brl, nf } from './format';

const CAP_ESCURA = '#2A1C12';

/** Cor da cápsula: dourada para destaques, escura para os demais. */
export function capColorFor(wine: Wine): string {
  return wine.destaque ? palette.gold : CAP_ESCURA;
}

/** "Tinto · Nebbiolo" */
export function tipoUva(wine: Wine): string {
  return `${wine.tipo} · ${wine.uva}`;
}

/** "Tinto · Nebbiolo · Piemonte" */
export function categoriaCompleta(wine: Wine): string {
  return `${wine.tipo} · ${wine.uva} · ${wine.regiao}`;
}

/** Mapeia um `Wine` para as props do `WineCard`. */
export function toWineCardData(wine: Wine, favorito = false): WineCardData {
  return {
    nome: wine.nome,
    categoria: tipoUva(wine),
    precoFmt: brl(wine.preco),
    notaFmt: nf(wine.notaMedia),
    cor: wine.cor,
    capColor: capColorFor(wine),
    iniciais: wine.iniciais,
    destaque: wine.destaque,
    favorito,
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
    nome: wine.nome,
    categoria: full ? categoriaCompleta(wine) : tipoUva(wine),
    precoFmt: withPrice ? brl(wine.preco) : undefined,
    cor: wine.cor,
    capColor: capColorFor(wine),
    iniciais: wine.iniciais,
  };
}
