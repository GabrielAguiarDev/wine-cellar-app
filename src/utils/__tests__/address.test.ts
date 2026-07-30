import { describe, expect, it } from '@jest/globals';

import { lookupCep } from '../../data/addresses';
import {
  addressLine,
  addressRegionLine,
  deliveryEstimate,
  formatCep,
  formatUf,
  isCepComplete,
} from '../address';

const BASE = {
  street: 'Rua Harmonia',
  number: '421',
  district: 'Vila Madalena',
  city: 'São Paulo',
  uf: 'SP',
  cep: '05435-000',
};

describe('formatCep', () => {
  it('insere o hífen depois do 5º dígito', () => {
    expect(formatCep('05435')).toBe('05435');
    expect(formatCep('05435000')).toBe('05435-000');
  });

  it('ignora o que não é dígito e corta no 8º', () => {
    expect(formatCep('05.435-000999')).toBe('05435-000');
  });
});

describe('isCepComplete', () => {
  it('exige 8 dígitos', () => {
    expect(isCepComplete('05435-00')).toBe(false);
    expect(isCepComplete('05435-000')).toBe(true);
  });
});

describe('formatUf', () => {
  it('deixa duas letras maiúsculas', () => {
    expect(formatUf('sp')).toBe('SP');
    expect(formatUf('s1p2')).toBe('SP');
    expect(formatUf('rjx')).toBe('RJ');
  });
});

describe('linhas de exibição', () => {
  it('junta rua e número, com complemento quando existe', () => {
    expect(addressLine(BASE)).toBe('Rua Harmonia, 421');
    expect(addressLine({ ...BASE, complement: 'apto 52' })).toBe(
      'Rua Harmonia, 421 · apto 52',
    );
  });

  it('monta bairro, cidade e UF', () => {
    expect(addressRegionLine(BASE)).toBe('Vila Madalena · São Paulo, SP');
  });
});

describe('deliveryEstimate', () => {
  it('promete 24h em SP e RJ', () => {
    expect(deliveryEstimate('SP')).toEqual({
      label: 'Entrega em 24h',
      express: true,
    });
    expect(deliveryEstimate('rj').express).toBe(true);
  });

  it('cai no prazo longo nas demais UFs', () => {
    expect(deliveryEstimate('RS')).toEqual({
      label: 'Entrega em 2 a 5 dias úteis',
      express: false,
    });
  });
});

describe('lookupCep', () => {
  it('acha o CEP conhecido com ou sem máscara', () => {
    expect(lookupCep('05435-000')?.street).toBe('Rua Harmonia');
    expect(lookupCep('05435000')?.city).toBe('São Paulo');
  });

  it('devolve null para CEP fora do mock — a tela cai no preenchimento à mão', () => {
    expect(lookupCep('99999-999')).toBeNull();
  });
});
