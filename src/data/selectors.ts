import { type Wine } from './types';
import { WINES } from './wines';

/** Marcador de categoria especial (curadoria/destaques). */
export const CAT_ESPECIAIS = '__especiais';

/** Busca um vinho por id (fallback: primeiro do catálogo). */
export function findWine(id: string, wines: Wine[] = WINES): Wine {
  return wines.find(w => w.id === id) ?? wines[0];
}

/** Rail "Selecionados para você": tintos ou destaques, 5 primeiros. */
export function railSelecionados(wines: Wine[] = WINES): Wine[] {
  return wines.filter(w => w.tipo === 'Tinto' || w.destaque).slice(0, 5);
}

/** Rail "Mais vendidos": por total de avaliações (desc), top 4. */
export function railMaisVendidos(wines: Wine[] = WINES): Wine[] {
  return [...wines].sort((a, b) => b.totalAvaliacoes - a.totalAvaliacoes).slice(0, 4);
}

/** Vinhos em destaque (VIP / curadoria reservada / especiais). */
export function especiais(wines: Wine[] = WINES): Wine[] {
  return wines.filter(w => w.destaque);
}

/** Vinhos de uma ocasião do sommelier (por lista de ids). */
export function winesByIds(ids: string[], wines: Wine[] = WINES): Wine[] {
  return ids.map(id => findWine(id, wines));
}

type SearchParams = {
  catFilter?: string | null;
  query?: string;
};

/** Busca por vinho: filtra por categoria/especiais e por texto (nome/uva/região/tipo). */
export function searchWines(
  { catFilter, query }: SearchParams,
  wines: Wine[] = WINES,
): Wine[] {
  let results: Wine[];
  if (catFilter === CAT_ESPECIAIS) {
    results = wines.filter(w => w.destaque);
  } else if (catFilter) {
    results = wines.filter(w => w.tipo === catFilter);
  } else {
    results = wines;
  }

  const qtxt = (query ?? '').trim().toLowerCase();
  if (qtxt) {
    results = results.filter(w =>
      `${w.nome} ${w.uva} ${w.regiao} ${w.tipo}`.toLowerCase().includes(qtxt),
    );
  }
  return results;
}

/** Busca por prato: casa o texto com as harmonizações. */
export function searchByDish(dishQuery: string, wines: Wine[] = WINES): Wine[] {
  const dtxt = dishQuery.trim().toLowerCase();
  if (!dtxt) return [];
  return wines.filter(w =>
    w.harmonizacoes.some(h => {
      const hl = h.toLowerCase();
      return hl.includes(dtxt) || dtxt.includes(hl.split(' ')[0]);
    }),
  );
}

/** Soma das quantidades no carrinho. */
export function cartCount(items: Record<string, number>): number {
  return Object.values(items).reduce((acc, q) => acc + q, 0);
}

/** Subtotal do carrinho em reais. */
export function cartSubtotal(
  items: Record<string, number>,
  wines: Wine[] = WINES,
): number {
  return Object.entries(items).reduce(
    (acc, [id, qty]) => acc + findWine(id, wines).preco * qty,
    0,
  );
}
