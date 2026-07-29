import { describe, expect, it } from '@jest/globals';

import { CAT_SPECIALS, WINE_TYPES } from '../filters';
import {
  cartCount,
  countByType,
  countriesWithCount,
  cartSubtotal,
  findWine,
  railBestSellers,
  railSelected,
  searchByDish,
  searchWines,
  specials,
  specialsSummary,
  winesByIds,
} from '../selectors';

describe('findWine', () => {
  it('encontra por id', () => {
    expect(findWine('corona-reale').name).toBe('Corona Reale');
  });
  it('faz fallback para o primeiro se não achar', () => {
    expect(findWine('inexistente').id).toBe('notte-eterna');
  });
});

describe('rails', () => {
  it('railSelected: tintos ou destaques, máx 5', () => {
    const r = railSelected();
    expect(r.length).toBe(5);
    expect(r.every(w => w.type === 'Tinto' || w.featured)).toBe(true);
  });

  it('railBestSellers: top 4 por avaliações desc', () => {
    const r = railBestSellers();
    expect(r.length).toBe(4);
    expect(r[0].id).toBe('corona-reale'); // 210 avaliações
    expect(r[0].reviewCount).toBeGreaterThanOrEqual(r[1].reviewCount);
  });

  it('specials: só destaques', () => {
    expect(specials().map(w => w.id).sort()).toEqual(
      ['corona-reale', 'notte-eterna', 'perla-nera'].sort(),
    );
  });
});

describe('specialsSummary', () => {
  it('resume contagem, faixa de safras e média da coleção reservada', () => {
    // notte-eterna 2019/4,7 · perla-nera 2018/4,9 · corona-reale 2016/4,8
    expect(specialsSummary()).toEqual({
      count: 3,
      vintageFrom: 2016,
      vintageTo: 2019,
      averageRating: 4.8,
    });
  });

  it('com um rótulo só, a faixa de safras colapsa nele', () => {
    const one = specials().slice(0, 1);
    expect(specialsSummary(one)).toEqual({
      count: 1,
      vintageFrom: 2019,
      vintageTo: 2019,
      averageRating: 4.7,
    });
  });

  it('devolve null quando não há destaques', () => {
    expect(specialsSummary([])).toBeNull();
  });
});

describe('countByType', () => {
  it('conta rótulos de um tipo', () => {
    expect(countByType('Tinto')).toBe(searchWines({ catFilter: 'Tinto' }).length);
  });

  it('a soma dos tipos cobre o catálogo inteiro', () => {
    const total = WINE_TYPES.reduce((acc, t) => acc + countByType(t), 0);
    expect(total).toBe(searchWines({}).length);
  });
});

describe('countriesWithCount', () => {
  it('ordena por quantidade de rótulos (desc)', () => {
    expect(countriesWithCount()).toEqual([
      { country: 'Itália', count: 5 },
      { country: 'França', count: 4 },
      { country: 'Argentina', count: 1 },
    ]);
  });

  it('a soma dos países cobre o catálogo inteiro', () => {
    const total = countriesWithCount().reduce((acc, c) => acc + c.count, 0);
    expect(total).toBe(searchWines({}).length);
  });

  it('cada contagem bate com o filtro de país', () => {
    for (const { country, count } of countriesWithCount()) {
      expect(searchWines({ filters: { country } }).length).toBe(count);
    }
  });
});

describe('winesByIds', () => {
  it('resolve na ordem dada', () => {
    expect(winesByIds(['perla-nera', 'alba-serena']).map(w => w.name)).toEqual([
      'Perla Nera',
      'Alba Serena',
    ]);
  });
});

describe('searchWines', () => {
  it('filtra por categoria (tipo)', () => {
    expect(searchWines({ catFilter: 'Branco' }).every(w => w.type === 'Branco')).toBe(true);
  });

  it('categoria especiais retorna destaques', () => {
    expect(searchWines({ catFilter: CAT_SPECIALS }).every(w => w.featured)).toBe(true);
  });

  it('busca textual por nome/uva/região/tipo', () => {
    expect(searchWines({ query: 'malbec' }).map(w => w.id)).toEqual(['velluto-rosso']);
    expect(searchWines({ query: 'bordeaux' }).map(w => w.id)).toEqual(['corona-reale']);
  });

  it('combina categoria + texto', () => {
    expect(searchWines({ catFilter: 'Tinto', query: 'toscana' }).map(w => w.id)).toEqual([
      'sangue-di-terra',
    ]);
  });
});

describe('searchByDish', () => {
  it('vazio quando sem query', () => {
    expect(searchByDish('')).toEqual([]);
  });
  it('casa com harmonizações', () => {
    const ids = searchByDish('salmão grelhado').map(w => w.id);
    expect(ids).toContain('fiore-inverno');
  });
});

describe('carrinho', () => {
  it('cartCount soma quantidades', () => {
    expect(cartCount({ 'notte-eterna': 2, 'alba-serena': 1 })).toBe(3);
  });
  it('cartSubtotal soma preço × qty', () => {
    // 489*1 + 129*2 = 747
    expect(cartSubtotal({ 'notte-eterna': 1, 'alba-serena': 2 })).toBe(747);
  });
});
