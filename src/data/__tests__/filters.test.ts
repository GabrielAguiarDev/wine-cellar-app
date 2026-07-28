import { describe, expect, it } from '@jest/globals';

import {
  CAT_SPECIALS,
  activeFilterCount,
  filterOptions,
  filterValueLabel,
  matchesFilters,
  wineCountry,
} from '../filters';
import { findWine, searchWines } from '../selectors';

const notte = findWine('notte-eterna'); // Tinto, Nebbiolo, Piemonte, R$ 489, destaque
const rosa = findWine('rosa-dei-venti'); // Rosé, Grenache, Provence, R$ 159

describe('filterOptions', () => {
  it('tipo: os quatro tipos + especiais', () => {
    expect(filterOptions('type').map(o => o.value)).toEqual([
      'Tinto',
      'Branco',
      'Rosé',
      'Espumante',
      CAT_SPECIALS,
    ]);
  });

  it('uva: sem repetição e em ordem alfabética', () => {
    const grapes = filterOptions('grape').map(o => o.value);
    expect(new Set(grapes).size).toBe(grapes.length);
    expect(grapes).toEqual([...grapes].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    expect(grapes).toContain('Nebbiolo');
  });

  it('país: derivado da região', () => {
    expect(filterOptions('country').map(o => o.value)).toEqual([
      'Argentina',
      'França',
      'Itália',
    ]);
    expect(wineCountry(notte)).toBe('Itália');
  });

  it('harmonização: capitalizada e sem repetição', () => {
    const pairings = filterOptions('pairing');
    expect(pairings.find(o => o.value === 'carnes vermelhas')?.label).toBe(
      'Carnes vermelhas',
    );
    expect(new Set(pairings.map(o => o.value)).size).toBe(pairings.length);
  });
});

describe('filterValueLabel', () => {
  it('traduz o valor da faixa de preço', () => {
    expect(filterValueLabel('price', 'ate-200')).toBe('Até R$ 200');
  });
  it('devolve o próprio valor quando não há opção', () => {
    expect(filterValueLabel('grape', 'Uva Fantasma')).toBe('Uva Fantasma');
  });
});

describe('matchesFilters', () => {
  it('sem filtros, tudo passa', () => {
    expect(matchesFilters(notte, {})).toBe(true);
  });

  it('tipo', () => {
    expect(matchesFilters(notte, { type: 'Tinto' })).toBe(true);
    expect(matchesFilters(rosa, { type: 'Tinto' })).toBe(false);
  });

  it('especiais = só destaques', () => {
    expect(matchesFilters(notte, { type: CAT_SPECIALS })).toBe(true);
    expect(matchesFilters(rosa, { type: CAT_SPECIALS })).toBe(false);
  });

  it('preço: min inclusivo, max exclusivo', () => {
    expect(matchesFilters(rosa, { price: 'ate-200' })).toBe(true); // 159
    expect(matchesFilters(notte, { price: '400-700' })).toBe(true); // 489
    expect(matchesFilters(notte, { price: '200-400' })).toBe(false);
    expect(matchesFilters(findWine('corona-reale'), { price: 'acima-700' })).toBe(true); // 890
  });

  it('corpo e harmonização', () => {
    expect(matchesFilters(notte, { body: 'Encorpado' })).toBe(true);
    expect(matchesFilters(notte, { body: 'Leve' })).toBe(false);
    expect(matchesFilters(notte, { pairing: 'carnes vermelhas' })).toBe(true);
    expect(matchesFilters(notte, { pairing: 'saladas' })).toBe(false);
  });

  it('combina filtros (E lógico)', () => {
    expect(matchesFilters(notte, { type: 'Tinto', country: 'Itália' })).toBe(true);
    expect(matchesFilters(notte, { type: 'Tinto', country: 'França' })).toBe(false);
  });
});

describe('activeFilterCount', () => {
  it('conta só os preenchidos', () => {
    expect(activeFilterCount({})).toBe(0);
    expect(activeFilterCount({ type: 'Tinto', grape: 'Nebbiolo' })).toBe(2);
  });
});

describe('searchWines com filtros', () => {
  it('aplica os filtros junto do texto', () => {
    expect(searchWines({ filters: { country: 'Argentina' } }).map(w => w.id)).toEqual([
      'velluto-rosso',
    ]);
    expect(
      searchWines({ filters: { type: 'Tinto', body: 'Médio' } }).map(w => w.id),
    ).toEqual(['sangue-di-terra']);
    expect(searchWines({ filters: { grape: 'Chardonnay' }, query: 'bourgogne' }).map(w => w.id)).toEqual([
      'lumiere-blanche',
    ]);
  });

  it('catFilter continua valendo como filtro de tipo', () => {
    expect(searchWines({ catFilter: 'Branco' }).every(w => w.type === 'Branco')).toBe(true);
  });
});
