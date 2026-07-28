import { type Wine, type WineBody, type WineType } from './types';
import { WINES } from './wines';

/** Marcador de categoria especial (curadoria/destaques). */
export const CAT_SPECIALS = '__specials';

/** Tipos de vinho na ordem em que aparecem na UI. */
export const WINE_TYPES: WineType[] = ['Tinto', 'Branco', 'Rosé', 'Espumante'];

/** Corpos na ordem leve → encorpado. */
export const WINE_BODIES: WineBody[] = ['Leve', 'Médio', 'Encorpado'];

export type WineFilterKey =
  | 'type'
  | 'grape'
  | 'country'
  | 'price'
  | 'body'
  | 'pairing';

/** Valor escolhido por filtro. Chave ausente = filtro inativo. */
export type WineFilters = Partial<Record<WineFilterKey, string>>;

export type FilterOption = {
  /** Valor guardado no estado (e comparado com o vinho). */
  value: string;
  /** Texto exibido no chip e na lista do modal. */
  label: string;
};

/** País de origem de cada região do catálogo. */
const REGION_COUNTRY: Record<string, string> = {
  Piemonte: 'Itália',
  Franciacorta: 'Itália',
  Puglia: 'Itália',
  Toscana: 'Itália',
  Veneto: 'Itália',
  Bordeaux: 'França',
  Bourgogne: 'França',
  Provence: 'França',
  Alsácia: 'França',
  Mendoza: 'Argentina',
};

/** País do vinho (fallback: a própria região, se não mapeada). */
export function wineCountry(wine: Wine): string {
  return REGION_COUNTRY[wine.region] ?? wine.region;
}

type PriceRange = FilterOption & { min: number; max: number };

/** Faixas de preço — `min` inclusivo, `max` exclusivo. */
export const PRICE_RANGES: PriceRange[] = [
  { value: 'ate-200', label: 'Até R$ 200', min: 0, max: 200 },
  { value: '200-400', label: 'R$ 200 a R$ 400', min: 200, max: 400 },
  { value: '400-700', label: 'R$ 400 a R$ 700', min: 400, max: 700 },
  { value: 'acima-700', label: 'Acima de R$ 700', min: 700, max: Infinity },
];

/** Definição de cada filtro da busca, na ordem dos chips. */
export const FILTER_DEFS: { key: WineFilterKey; label: string }[] = [
  { key: 'type', label: 'Tipo' },
  { key: 'grape', label: 'Uva' },
  { key: 'country', label: 'País' },
  { key: 'price', label: 'Preço' },
  { key: 'body', label: 'Corpo' },
  { key: 'pairing', label: 'Harmonização' },
];

const byLabel = (a: FilterOption, b: FilterOption) =>
  a.label.localeCompare(b.label, 'pt-BR');

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Valores distintos de um campo, como opções ordenadas. */
function distinct(
  values: string[],
  toLabel: (value: string) => string = v => v,
): FilterOption[] {
  return [...new Set(values)]
    .map(value => ({ value, label: toLabel(value) }))
    .sort(byLabel);
}

/** Opções de um filtro, derivadas do catálogo. */
export function filterOptions(
  key: WineFilterKey,
  wines: Wine[] = WINES,
): FilterOption[] {
  switch (key) {
    case 'type':
      return [
        ...WINE_TYPES.map(t => ({ value: t, label: t })),
        { value: CAT_SPECIALS, label: 'Especiais' },
      ];
    case 'grape':
      return distinct(wines.map(w => w.grape));
    case 'country':
      return distinct(wines.map(wineCountry));
    case 'price':
      return PRICE_RANGES.map(({ value, label }) => ({ value, label }));
    case 'body':
      return WINE_BODIES.map(b => ({ value: b, label: b }));
    case 'pairing':
      return distinct(
        wines.flatMap(w => w.pairings),
        capitalize,
      );
  }
}

/** Rótulo de um valor escolhido (ex.: 'ate-200' → 'Até R$ 200'). */
export function filterValueLabel(key: WineFilterKey, value: string): string {
  return filterOptions(key).find(o => o.value === value)?.label ?? value;
}

/** Quantos filtros estão ativos. */
export function activeFilterCount(filters: WineFilters): number {
  return Object.values(filters).filter(Boolean).length;
}

function matchesPrice(wine: Wine, value: string): boolean {
  const range = PRICE_RANGES.find(r => r.value === value);
  if (!range) return true;
  return wine.price >= range.min && wine.price < range.max;
}

/** O vinho atende a TODOS os filtros ativos. */
export function matchesFilters(wine: Wine, filters: WineFilters): boolean {
  const { type, grape, country, price, body, pairing } = filters;

  if (type === CAT_SPECIALS) {
    if (!wine.featured) return false;
  } else if (type && wine.type !== type) {
    return false;
  }
  if (grape && wine.grape !== grape) return false;
  if (country && wineCountry(wine) !== country) return false;
  if (price && !matchesPrice(wine, price)) return false;
  if (body && wine.body !== body) return false;
  if (pairing && !wine.pairings.includes(pairing)) return false;

  return true;
}
