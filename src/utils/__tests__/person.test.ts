import { describe, expect, it } from '@jest/globals';

import {
  firstName,
  formatBirthdate,
  formatCpf,
  formatPhone,
  initials,
  isBirthdateComplete,
  isCpfComplete,
  isEmail,
  isFullName,
  isPhoneComplete,
} from '../person';

describe('initials', () => {
  it('usa a primeira e a ÚLTIMA palavra', () => {
    expect(initials('Helena Prado')).toBe('HP');
    expect(initials('Helena Maria Prado')).toBe('HP');
  });

  it('ignora partículas', () => {
    expect(initials('Helena de Souza')).toBe('HS');
    expect(initials('Maria das Dores Alves')).toBe('MA');
  });

  it('lida com nome único e com vazio', () => {
    expect(initials('Helena')).toBe('H');
    expect(initials('   ')).toBe('');
  });
});

describe('firstName', () => {
  it('pega a primeira palavra', () => {
    expect(firstName('Helena Maria Prado')).toBe('Helena');
  });
});

describe('isFullName', () => {
  it('exige duas palavras de 2+ letras', () => {
    expect(isFullName('Helena')).toBe(false);
    expect(isFullName('Helena P')).toBe(false);
    expect(isFullName('Helena Prado')).toBe(true);
  });
});

describe('isEmail', () => {
  it('aceita forma válida e recusa o resto', () => {
    expect(isEmail('helena@ildivino.com.br')).toBe(true);
    expect(isEmail('helena@ildivino')).toBe(false);
    expect(isEmail('helena.ildivino.com')).toBe(false);
    expect(isEmail('he lena@ildivino.com')).toBe(false);
  });
});

describe('formatPhone', () => {
  it('põe o DDD entre parênteses', () => {
    expect(formatPhone('11')).toBe('11');
    expect(formatPhone('1198')).toBe('(11) 98');
  });

  it('quebra em 4 no fixo e em 5 no celular', () => {
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('descarta dígito além do 11º', () => {
    expect(formatPhone('11987654321999')).toBe('(11) 98765-4321');
  });
});

describe('isPhoneComplete', () => {
  it('aceita fixo (10) e celular (11)', () => {
    expect(isPhoneComplete('(11) 3456-789')).toBe(false);
    expect(isPhoneComplete('(11) 3456-7890')).toBe(true);
    expect(isPhoneComplete('(11) 98765-4321')).toBe(true);
  });
});

describe('formatCpf', () => {
  it('agrupa 3.3.3-2', () => {
    expect(formatCpf('123')).toBe('123');
    expect(formatCpf('123456')).toBe('123.456');
    expect(formatCpf('12345678901')).toBe('123.456.789-01');
  });

  it('corta no 11º dígito', () => {
    expect(formatCpf('1234567890199')).toBe('123.456.789-01');
  });
});

describe('isCpfComplete', () => {
  it('só conta dígitos', () => {
    expect(isCpfComplete('123.456.789-0')).toBe(false);
    expect(isCpfComplete('123.456.789-01')).toBe(true);
  });
});

describe('formatBirthdate', () => {
  it('insere as barras', () => {
    expect(formatBirthdate('01')).toBe('01');
    expect(formatBirthdate('0102')).toBe('01/02');
    expect(formatBirthdate('01021990')).toBe('01/02/1990');
  });

  it('trava dia em 31 e mês em 12', () => {
    expect(formatBirthdate('40131990')).toBe('31/12/1990');
    expect(formatBirthdate('0000')).toBe('01/01');
  });
});

describe('isBirthdateComplete', () => {
  it('exige DD/MM/AAAA com dia e mês possíveis', () => {
    expect(isBirthdateComplete('01/02/199')).toBe(false);
    expect(isBirthdateComplete('01/02/1990')).toBe(true);
    expect(isBirthdateComplete('01/02/1890')).toBe(false);
  });
});
