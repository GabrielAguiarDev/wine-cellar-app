import { describe, expect, it } from '@jest/globals';

import { MOCK_OTP_CODE } from '../authApi';
import { authService } from '../authService';
import { AuthError, type OtpChallenge } from '../authTypes';
import { OTP_LENGTH } from '../otp';

/**
 * Testa as REGRAS do service contra o mock de `authApi` — que é o próprio
 * backend enquanto a Fase 16 não chega. O que importa aqui é o que o service
 * decide ANTES da rede (validar, deduzir canal, matar desafio vencido) e que
 * tudo que sai dele é `AuthError`.
 */

const challengeExpiring = (expiresAt: string): OtpChallenge => ({
  id: 'otp_1',
  channel: 'email',
  destination: 'helena.prado@email.com',
  length: OTP_LENGTH,
  expiresAt,
});

describe('authService.requestOtp', () => {
  it('não sai na rede com destino incompleto', async () => {
    await expect(authService.requestOtp('(11) 9876')).rejects.toMatchObject({
      code: 'invalid-destination',
    });
  });

  it('deduz o canal do que foi digitado', async () => {
    await expect(
      authService.requestOtp('helena.prado@email.com'),
    ).resolves.toMatchObject({ channel: 'email' });
    await expect(
      authService.requestOtp('(11) 98765-4321'),
    ).resolves.toMatchObject({
      channel: 'phone',
    });
  });

  it('devolve um desafio com o comprimento do código', async () => {
    const challenge = await authService.requestOtp('helena.prado@email.com');
    expect(challenge.length).toBe(OTP_LENGTH);
    expect(challenge.id).toMatch(/^otp_/);
  });
});

describe('authService.verifyOtp', () => {
  const future = '2999-01-01T00:00:00.000Z';

  it('recusa código incompleto sem ir ao servidor', async () => {
    await expect(
      authService.verifyOtp(challengeExpiring(future), '123'),
    ).rejects.toMatchObject({ code: 'invalid-code' });
  });

  it('recusa desafio vencido antes da rede', async () => {
    await expect(
      authService.verifyOtp(
        challengeExpiring('2020-01-01T00:00:00.000Z'),
        MOCK_OTP_CODE,
      ),
    ).rejects.toMatchObject({ code: 'expired-code' });
  });

  it('recusa código errado (decisão do servidor)', async () => {
    await expect(
      authService.verifyOtp(challengeExpiring(future), '999999'),
    ).rejects.toMatchObject({ code: 'invalid-code' });
  });

  it('devolve sessão do provedor `otp` no código certo', async () => {
    const session = await authService.verifyOtp(
      challengeExpiring(future),
      MOCK_OTP_CODE,
    );
    expect(session.user.provider).toBe('otp');
    expect(session.token).toBeTruthy();
  });

  it('tudo que rejeita é AuthError — a tela só lê `code`', async () => {
    await expect(
      authService.verifyOtp(challengeExpiring(future), '1'),
    ).rejects.toBeInstanceOf(AuthError);
  });
});

describe('authService.signInWithProvider', () => {
  it('devolve sessão marcada com o provedor', async () => {
    const session = await authService.signInWithProvider('apple');
    expect(session.user.provider).toBe('apple');
  });
});

describe('authService.signOut', () => {
  it('nunca rejeita — a sessão local sai de todo jeito', async () => {
    await expect(authService.signOut()).resolves.toBeUndefined();
  });
});
