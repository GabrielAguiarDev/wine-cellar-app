import { describe, expect, it } from '@jest/globals';

import { resolveGateRoute, resolveGateStep, type GateFlags } from '../authGate';

const flags = (over: Partial<GateFlags> = {}): GateFlags => ({
  welcomeSeen: false,
  signedIn: false,
  palateDone: false,
  ...over,
});

describe('resolveGateStep', () => {
  it('manda para as boas-vindas na instalação limpa', () => {
    expect(resolveGateStep(flags())).toBe('welcome');
  });

  it('pede login depois dos slides', () => {
    expect(resolveGateStep(flags({ welcomeSeen: true }))).toBe('signIn');
  });

  it('pede o paladar depois do login', () => {
    expect(resolveGateStep(flags({ welcomeSeen: true, signedIn: true }))).toBe(
      'palate',
    );
  });

  it('libera o app com as três etapas vencidas', () => {
    expect(
      resolveGateStep(
        flags({ welcomeSeen: true, signedIn: true, palateDone: true }),
      ),
    ).toBe('app');
  });

  it('retoma de onde parou: interrompido antes de entrar volta ao login', () => {
    expect(
      resolveGateStep(flags({ welcomeSeen: true, palateDone: false })),
    ).toBe('signIn');
  });

  it('quem sai da conta volta só ao login, não aos slides nem ao quiz', () => {
    expect(
      resolveGateStep(flags({ welcomeSeen: true, palateDone: true })),
    ).toBe('signIn');
  });

  it('precedência: sessão gravada não pula os slides', () => {
    // Estado que não deveria existir, mas se existir a ordem tem de valer.
    expect(resolveGateStep(flags({ signedIn: true, palateDone: true }))).toBe(
      'welcome',
    );
  });
});

describe('resolveGateRoute', () => {
  it('traduz cada etapa na rota da árvore de `app/`', () => {
    expect(resolveGateRoute(flags())).toBe('/welcome');
    expect(resolveGateRoute(flags({ welcomeSeen: true }))).toBe('/sign-in');
    expect(resolveGateRoute(flags({ welcomeSeen: true, signedIn: true }))).toBe(
      '/quiz',
    );
    expect(
      resolveGateRoute(
        flags({ welcomeSeen: true, signedIn: true, palateDone: true }),
      ),
    ).toBe('/home');
  });

  it('é idempotente — mesma entrada, mesma saída (requisito, ver authGate)', () => {
    const input = flags({ welcomeSeen: true, signedIn: true });
    expect(resolveGateRoute(input)).toBe(resolveGateRoute(input));
  });
});
