import { describe, expect, it } from '@jest/globals';

import { brl, nf } from '../format';

describe('brl', () => {
  it('formata inteiros sem separador', () => {
    expect(brl(489)).toBe('R$ 489');
    expect(brl(0)).toBe('R$ 0');
  });

  it('agrupa milhares com ponto', () => {
    expect(brl(1200)).toBe('R$ 1.200');
    expect(brl(1000000)).toBe('R$ 1.000.000');
  });

  it('arredonda decimais', () => {
    expect(brl(489.4)).toBe('R$ 489');
    expect(brl(489.6)).toBe('R$ 490');
  });
});

describe('nf', () => {
  it('usa 1 casa decimal com vírgula', () => {
    expect(nf(4.7)).toBe('4,7');
    expect(nf(5)).toBe('5,0');
    expect(nf(4.25)).toBe('4,3');
  });
});
