import { describe, expect, it } from '@jest/globals';

import {
  CAT_ESPECIAIS,
  cartCount,
  cartSubtotal,
  especiais,
  findWine,
  railMaisVendidos,
  railSelecionados,
  searchByDish,
  searchWines,
  winesByIds,
} from '../selectors';

describe('findWine', () => {
  it('encontra por id', () => {
    expect(findWine('corona-reale').nome).toBe('Corona Reale');
  });
  it('faz fallback para o primeiro se não achar', () => {
    expect(findWine('inexistente').id).toBe('notte-eterna');
  });
});

describe('rails', () => {
  it('railSelecionados: tintos ou destaques, máx 5', () => {
    const r = railSelecionados();
    expect(r.length).toBe(5);
    expect(r.every(w => w.tipo === 'Tinto' || w.destaque)).toBe(true);
  });

  it('railMaisVendidos: top 4 por avaliações desc', () => {
    const r = railMaisVendidos();
    expect(r.length).toBe(4);
    expect(r[0].id).toBe('corona-reale'); // 210 avaliações
    expect(r[0].totalAvaliacoes).toBeGreaterThanOrEqual(r[1].totalAvaliacoes);
  });

  it('especiais: só destaques', () => {
    expect(especiais().map(w => w.id).sort()).toEqual(
      ['corona-reale', 'notte-eterna', 'perla-nera'].sort(),
    );
  });
});

describe('winesByIds', () => {
  it('resolve na ordem dada', () => {
    expect(winesByIds(['perla-nera', 'alba-serena']).map(w => w.nome)).toEqual([
      'Perla Nera',
      'Alba Serena',
    ]);
  });
});

describe('searchWines', () => {
  it('filtra por categoria (tipo)', () => {
    expect(searchWines({ catFilter: 'Branco' }).every(w => w.tipo === 'Branco')).toBe(true);
  });

  it('categoria especiais retorna destaques', () => {
    expect(searchWines({ catFilter: CAT_ESPECIAIS }).every(w => w.destaque)).toBe(true);
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
