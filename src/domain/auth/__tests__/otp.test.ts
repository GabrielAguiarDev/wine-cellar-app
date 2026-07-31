import { describe, expect, it } from '@jest/globals';

import { type OtpChallenge } from '../authTypes';
import {
  OTP_LENGTH,
  formatOtpCode,
  formatOtpDestination,
  isChallengeExpired,
  isOtpCodeComplete,
  isOtpDestinationComplete,
  maskOtpDestination,
  otpChannelOf,
} from '../otp';

describe('otpChannelOf', () => {
  it('trata como telefone tudo que só tem dígito e pontuação de telefone', () => {
    expect(otpChannelOf('')).toBe('phone');
    expect(otpChannelOf('11')).toBe('phone');
    expect(otpChannelOf('(11) 98765-4321')).toBe('phone');
    expect(otpChannelOf('+55 11 98765 4321')).toBe('phone');
  });

  it('vira e-mail no primeiro caractere que telefone não tem', () => {
    expect(otpChannelOf('h')).toBe('email');
    expect(otpChannelOf('helena.prado@email.com')).toBe('email');
    expect(otpChannelOf('11@')).toBe('email');
  });
});

describe('formatOtpDestination', () => {
  it('aplica a máscara de telefone do app', () => {
    expect(formatOtpDestination('11987654321')).toBe('(11) 98765-4321');
  });

  it('não mexe no e-mail além de tirar espaço das pontas', () => {
    expect(formatOtpDestination('  Helena@Email.com ')).toBe(
      'Helena@Email.com',
    );
  });
});

describe('isOtpDestinationComplete', () => {
  it('aceita e-mail plausível e telefone BR completo', () => {
    expect(isOtpDestinationComplete('helena.prado@email.com')).toBe(true);
    expect(isOtpDestinationComplete('(11) 98765-4321')).toBe(true);
    expect(isOtpDestinationComplete('(11) 3456-7890')).toBe(true);
  });

  it('recusa o que está pela metade', () => {
    expect(isOtpDestinationComplete('')).toBe(false);
    expect(isOtpDestinationComplete('(11) 9876')).toBe(false);
    expect(isOtpDestinationComplete('helena@')).toBe(false);
    expect(isOtpDestinationComplete('helena@email')).toBe(false);
  });
});

describe('maskOtpDestination', () => {
  it('preserva duas letras e o domínio do e-mail', () => {
    expect(maskOtpDestination('helena.prado@email.com')).toBe(
      'he•••@email.com',
    );
  });

  it('preserva DDD e os quatro últimos dígitos do telefone', () => {
    expect(maskOtpDestination('(11) 98765-4321')).toBe('(11) •••••-4321');
    expect(maskOtpDestination('(11) 3456-7890')).toBe('(11) ••••-7890');
  });

  it('não mascara telefone curto demais para sobrar o que esconder', () => {
    expect(maskOtpDestination('(11) 98')).toBe('(11) 98');
  });
});

describe('formatOtpCode / isOtpCodeComplete', () => {
  it('mantém só dígitos, no comprimento do código', () => {
    expect(formatOtpCode('12a34b56789')).toBe('123456');
    expect(formatOtpCode('12 34', 4)).toBe('1234');
  });

  it('completo é exatamente o comprimento pedido', () => {
    expect(isOtpCodeComplete('123456')).toBe(true);
    expect(isOtpCodeComplete('12345')).toBe(false);
    expect(isOtpCodeComplete('1234', 4)).toBe(true);
  });

  it('OTP_LENGTH é o default', () => {
    expect(formatOtpCode('1234567890')).toHaveLength(OTP_LENGTH);
  });
});

describe('isChallengeExpired', () => {
  const challenge: OtpChallenge = {
    id: 'otp_1',
    channel: 'email',
    destination: 'helena.prado@email.com',
    length: OTP_LENGTH,
    expiresAt: '2026-07-31T12:05:00.000Z',
  };

  it('vale antes do vencimento', () => {
    expect(isChallengeExpired(challenge, '2026-07-31T12:04:59.999Z')).toBe(
      false,
    );
  });

  it('vence no instante exato e depois dele', () => {
    expect(isChallengeExpired(challenge, '2026-07-31T12:05:00.000Z')).toBe(
      true,
    );
    expect(isChallengeExpired(challenge, '2026-07-31T12:06:00.000Z')).toBe(
      true,
    );
  });
});
