import { describe, expect, it } from '@jest/globals';

import {
  cardBrand,
  cardLast4,
  cardNumberPreview,
  formatCardNumber,
  formatExpiry,
  isCardNumberComplete,
  isCvvComplete,
  isExpiryComplete,
} from '../card';

describe('cardBrand', () => {
  it('reconhece as bandeiras pelo prefixo', () => {
    expect(cardBrand('4111 1111 1111 1111')).toBe('visa');
    expect(cardBrand('5555 5555 5555 4444')).toBe('mastercard');
    expect(cardBrand('2223 0000 0000 0000')).toBe('mastercard');
    expect(cardBrand('3782 822463 10005')).toBe('amex');
  });

  it('prioriza Elo sobre os prefixos que ela compartilha', () => {
    // 4011 também é um "4" (Visa) e 5041 também é um "50" (Mastercard).
    expect(cardBrand('4011 7800 0000 0000')).toBe('elo');
    expect(cardBrand('5041 7500 0000 0000')).toBe('elo');
  });

  it('devolve unknown para vazio e para prefixo fora do mapa', () => {
    expect(cardBrand('')).toBe('unknown');
    expect(cardBrand('9999 9999')).toBe('unknown');
  });
});

describe('formatCardNumber', () => {
  it('agrupa de 4 em 4 e ignora o que não é dígito', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('4111-1111')).toBe('4111 1111');
  });

  it('usa 4-6-5 no Amex', () => {
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
  });

  it('corta no tamanho da bandeira', () => {
    expect(formatCardNumber('41111111111111119999')).toBe(
      '4111 1111 1111 1111',
    );
    expect(formatCardNumber('3782822463100059999')).toBe('3782 822463 10005');
  });
});

describe('cardNumberPreview', () => {
  it('mantém a máscara completa desde o primeiro dígito', () => {
    expect(cardNumberPreview('')).toBe('•••• •••• •••• ••••');
    expect(cardNumberPreview('4111')).toBe('4111 •••• •••• ••••');
    expect(cardNumberPreview('411111111111')).toBe('4111 1111 1111 ••••');
  });

  it('acompanha o agrupamento do Amex', () => {
    expect(cardNumberPreview('3782')).toBe('3782 •••••• •••••');
  });
});

describe('formatExpiry', () => {
  it('insere a barra depois do mês', () => {
    expect(formatExpiry('09')).toBe('09');
    expect(formatExpiry('0928')).toBe('09/28');
  });

  it('completa o mês de um dígito quando ele só pode ser esse', () => {
    expect(formatExpiry('5')).toBe('05');
    expect(formatExpiry('1')).toBe('1');
  });

  it('trava o mês em 01–12', () => {
    expect(formatExpiry('1328')).toBe('12/28');
    expect(formatExpiry('0028')).toBe('01/28');
  });

  it('devolve vazio sem dígitos', () => {
    expect(formatExpiry('/')).toBe('');
  });
});

describe('completude dos campos', () => {
  it('número depende do tamanho da bandeira', () => {
    expect(isCardNumberComplete('4111 1111 1111 111')).toBe(false);
    expect(isCardNumberComplete('4111 1111 1111 1111')).toBe(true);
    expect(isCardNumberComplete('3782 822463 10005')).toBe(true);
  });

  it('validade exige MM/AA com mês real', () => {
    expect(isExpiryComplete('09/2')).toBe(false);
    expect(isExpiryComplete('09/28')).toBe(true);
    expect(isExpiryComplete('99/28')).toBe(false);
  });

  it('CVV tem 4 dígitos no Amex e 3 nos demais', () => {
    expect(isCvvComplete('123', 'visa')).toBe(true);
    expect(isCvvComplete('123', 'amex')).toBe(false);
    expect(isCvvComplete('1234', 'amex')).toBe(true);
  });
});

describe('cardLast4', () => {
  it('pega os últimos quatro dígitos', () => {
    expect(cardLast4('4111 1111 1111 4821')).toBe('4821');
  });
});
