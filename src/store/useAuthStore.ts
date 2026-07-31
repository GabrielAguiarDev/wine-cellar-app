import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  authService,
  toAuthErrorCode,
  type AuthErrorCode,
  type AuthProvider,
  type AuthSession,
  type OtpChallenge,
} from '@domain/auth';

/**
 * `authenticating` cobre TODAS as esperas de rede (social, pedir código,
 * conferir código): a UI só precisa saber que há algo em voo para travar o
 * botão. Se um dia duas esperas puderem coexistir na mesma tela, isto vira um
 * `Record<operação, boolean>` — hoje não podem.
 */
export type AuthStatus = 'signedOut' | 'authenticating' | 'signedIn';

type AuthState = {
  session: AuthSession | null;
  status: AuthStatus;
  /** Desafio de código em aberto. **Não** persistido — ver `OtpChallenge`. */
  challenge: OtpChallenge | null;
  /** Último erro, para a tela mostrar `AUTH_ERROR_MESSAGE[code]`. */
  error: AuthErrorCode | null;

  signInWithProvider: (
    provider: Extract<AuthProvider, 'apple' | 'google'>,
  ) => Promise<boolean>;
  requestOtp: (destination: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearChallenge: () => void;
  clearError: () => void;
};

/**
 * Sessão do usuário. Persistido em AsyncStorage para não pedir login a cada
 * relaunch — é o mesmo padrão de `useUserStore`, e por isso `app/index.tsx`
 * espera a hidratação dos DOIS antes de decidir a rota (ver `useAppHydrated`).
 *
 * ── Por que as chamadas de rede moram no store ──────────────────────────────
 *
 * Porque ainda não há react-query no projeto (Fase 16). As ações abaixo são
 * cascas finas sobre `authService`: elas só traduzem promessa em estado
 * (`status`/`error`) e devolvem **boolean** — a tela navega no `true`, mostra
 * toast no `false`, e nunca precisa de `try/catch`.
 *
 * Na Fase 16 cada ação vira um `useMutation` com `mutationFn: authService.*`, e
 * o que sobra aqui é `session` + `signOut`. `authService` não muda.
 *
 * ⚠️ `partialize` grava **só a sessão**. `status`/`challenge`/`error` são de
 * runtime: um `authenticating` gravado deixaria o app travado no relaunch, e um
 * desafio ressuscitado apontaria para um código que já morreu no servidor.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      status: 'signedOut',
      challenge: null,
      error: null,

      signInWithProvider: async provider => {
        set({ status: 'authenticating', error: null });
        try {
          const session = await authService.signInWithProvider(provider);
          set({ session, status: 'signedIn', challenge: null });
          return true;
        } catch (error) {
          set({ status: 'signedOut', error: toAuthErrorCode(error) });
          return false;
        }
      },

      requestOtp: async destination => {
        set({ status: 'authenticating', error: null });
        try {
          const challenge = await authService.requestOtp(destination);
          set({ challenge, status: 'signedOut' });
          return true;
        } catch (error) {
          set({ status: 'signedOut', error: toAuthErrorCode(error) });
          return false;
        }
      },

      verifyOtp: async code => {
        const { challenge } = get();
        if (!challenge) {
          // Sem desafio não há o que conferir. Acontece se a tela de código for
          // aberta por deep link — ela redireciona, mas a ação também se protege.
          set({ error: 'expired-code' });
          return false;
        }

        set({ status: 'authenticating', error: null });
        try {
          const session = await authService.verifyOtp(challenge, code);
          set({ session, status: 'signedIn', challenge: null });
          return true;
        } catch (error) {
          const code_ = toAuthErrorCode(error);
          // Código vencido some com o desafio: insistir nele não vai funcionar,
          // a tela tem de voltar a pedir um novo.
          set({
            status: 'signedOut',
            error: code_,
            challenge: code_ === 'expired-code' ? null : challenge,
          });
          return false;
        }
      },

      signOut: async () => {
        // Apaga a sessão local ANTES da rede: o efeito visível (voltar ao login,
        // via guarda do `_layout`) não deve esperar um servidor que pode estar
        // fora. `authService.signOut` nunca rejeita.
        set({
          session: null,
          status: 'signedOut',
          challenge: null,
          error: null,
        });
        await authService.signOut();
      },

      clearChallenge: () => set({ challenge: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'ildivino-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ session: state.session }),
      version: 1,
      /**
       * O `status` precisa nascer coerente com a sessão hidratada — sem isto o
       * app abriria com `signedOut` mesmo tendo sessão, e qualquer tela que olhe
       * `status` (em vez de `session`) piscaria o estado errado.
       */
      onRehydrateStorage: () => state => {
        if (state?.session) {
          state.status = 'signedIn';
        }
      },
    },
  ),
);
