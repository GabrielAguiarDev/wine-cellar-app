import { matchesFilters, wineCountry, type WineFilters } from './filters';
import { type Wine, type WineType } from './types';
import { WINES } from './wines';

/** Quantos rótulos do catálogo são de um tipo (contagem dos atalhos). */
export function countByType(type: WineType, wines: Wine[] = WINES): number {
  return wines.filter(w => w.type === type).length;
}

/**
 * Países presentes no catálogo com a contagem de rótulos, do mais representado
 * ao menos (empate: ordem alfabética). Alimenta os atalhos por país da Home —
 * a lista sai do catálogo, então um país novo aparece sozinho.
 */
export function countriesWithCount(
  wines: Wine[] = WINES,
): { country: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const wine of wines) {
    const country = wineCountry(wine);
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return [...counts]
    .map(([country, count]) => ({ country, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.country.localeCompare(b.country, 'pt-BR'),
    );
}

/** Busca um vinho por id (fallback: primeiro do catálogo). */
export function findWine(id: string, wines: Wine[] = WINES): Wine {
  return wines.find(w => w.id === id) ?? wines[0];
}

/** Rail "Selecionados para você": tintos ou destaques, 5 primeiros. */
export function railSelected(wines: Wine[] = WINES): Wine[] {
  return wines.filter(w => w.type === 'Tinto' || w.featured).slice(0, 5);
}

/** Rail "Mais vendidos": por total de avaliações (desc), top 4. */
export function railBestSellers(wines: Wine[] = WINES): Wine[] {
  return [...wines].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
}

/** Vinhos em destaque (VIP / curadoria reservada / especiais). */
export function specials(wines: Wine[] = WINES): Wine[] {
  return wines.filter(w => w.featured);
}

export type CollectionSummary = {
  count: number;
  /** Safra mais antiga da coleção. */
  vintageFrom: number;
  /** Safra mais recente. Igual a `vintageFrom` se houver uma só. */
  vintageTo: number;
  /**
   * Média simples das notas, arredondada a 1 casa — a mesma precisão das notas
   * do catálogo. Sem arredondar, a soma de floats devolve `4.800000000000001`.
   */
  averageRating: number;
};

/**
 * Resumo da coleção reservada — alimenta a faixa de dados de `/reserved`.
 * Sai do catálogo (via `specials`), então marcar/desmarcar um rótulo como
 * `featured` já move a faixa. `null` com a coleção vazia: sem rótulos não há
 * faixa de safras nem média a exibir, e a tela esconde a faixa inteira.
 */
export function specialsSummary(
  wines: Wine[] = WINES,
): CollectionSummary | null {
  const list = specials(wines);
  if (list.length === 0) {
    return null;
  }

  const vintages = list.map(w => w.vintage);
  const ratingSum = list.reduce((acc, w) => acc + w.averageRating, 0);

  return {
    count: list.length,
    vintageFrom: Math.min(...vintages),
    vintageTo: Math.max(...vintages),
    averageRating: Math.round((ratingSum / list.length) * 10) / 10,
  };
}

/** Vinhos de uma ocasião do sommelier (por lista de ids). */
export function winesByIds(ids: string[], wines: Wine[] = WINES): Wine[] {
  return ids.map(id => findWine(id, wines));
}

type SearchParams = {
  /** Atalho para `filters.type` (param `cat` da rota). */
  catFilter?: string | null;
  query?: string;
  /** Filtros da busca (tipo/uva/país/preço/corpo/harmonização). */
  filters?: WineFilters;
};

/** Busca por vinho: aplica os filtros ativos e o texto (nome/uva/região/tipo). */
export function searchWines(
  { catFilter, query, filters }: SearchParams,
  wines: Wine[] = WINES,
): Wine[] {
  const all: WineFilters = {
    ...(catFilter ? { type: catFilter } : {}),
    ...filters,
  };
  let results = wines.filter(w => matchesFilters(w, all));

  const qtxt = (query ?? '').trim().toLowerCase();
  if (qtxt) {
    results = results.filter(w =>
      `${w.name} ${w.grape} ${w.region} ${w.type}`.toLowerCase().includes(qtxt),
    );
  }
  return results;
}

/** Busca por prato: casa o texto com as harmonizações. */
export function searchByDish(dishQuery: string, wines: Wine[] = WINES): Wine[] {
  const dtxt = dishQuery.trim().toLowerCase();
  if (!dtxt) return [];
  return wines.filter(w =>
    w.pairings.some(p => {
      const pl = p.toLowerCase();
      return pl.includes(dtxt) || dtxt.includes(pl.split(' ')[0]);
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
    (acc, [id, qty]) => acc + findWine(id, wines).price * qty,
    0,
  );
}
