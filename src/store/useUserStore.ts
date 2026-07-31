import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Cadastro da pessoa — o que `/personal-data` edita.
 *
 * Fica no store do usuário (e não num store novo) porque é a MESMA identidade
 * que já mora aqui: paladar e pontos são atributos dessa pessoa. Quem lê hoje: o
 * card do Perfil (nome + iniciais) e o cadastro de cartão (titular sugerido).
 *
 * Tudo em texto MASCARADO, como foi digitado. Guardar só dígitos obrigaria toda
 * tela de leitura a remascarar, e a única que escreve é a de dados pessoais.
 */
export type UserProfile = {
  name: string;
  email: string;
  /** "(11) 98765-4321". */
  phone: string;
  /** "123.456.789-01". */
  cpf: string;
  /** "DD/MM/AAAA". */
  birthdate: string;
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Helena Prado',
  email: 'helena.prado@email.com',
  phone: '(11) 98765-4321',
  cpf: '',
  birthdate: '',
};

type UserState = {
  /** Resultado do quiz de paladar (default 'encorpado'). */
  palate: string;
  /** Pontos de fidelidade. */
  points: number;
  /**
   * Etapas de entrada JÁ VENCIDAS. Duas flags e não uma (`onboarded`, como era
   * até 2026-07-31) porque agora há três etapas — slides, login, paladar — e o
   * login não é nosso para marcar: quem responde por ele é a sessão em
   * `useAuthStore`. Com flags separadas, quem é interrompido no meio volta de
   * onde parou, e quem sai da conta não refaz os slides nem o quiz.
   *
   * Moram aqui, e não num store novo, pelo mesmo motivo que `profile`: são
   * atributos DESTA pessoa, e um store persistido a mais é uma hidratação a mais
   * para o gate esperar. Quem lê as duas é `resolveGateRoute` (`@domain/auth`).
   */
  welcomeSeen: boolean;
  palateDone: boolean;
  profile: UserProfile;
  setPalate: (palate: string) => void;
  /** Fim dos slides de boas-vindas. */
  markWelcomeSeen: () => void;
  /** Fim do quiz de paladar — inclusive quando é "Pular". */
  markPalateDone: () => void;
  setProfile: (profile: UserProfile) => void;
};

/**
 * Preferências, fidelidade e cadastro do usuário. Persistido em AsyncStorage
 * para que o quiz de paladar só apareça no primeiro acesso — e, agora, para que
 * o cadastro editado sobreviva ao fechar o app.
 *
 * ⚠️ `partialize` é uma lista EXPLÍCITA: campo novo que não entrar ali não é
 * gravado, e o bug só aparece no relaunch.
 */
export const useUserStore = create<UserState>()(
  persist(
    set => ({
      palate: 'encorpado',
      points: 320,
      welcomeSeen: false,
      palateDone: false,
      profile: DEFAULT_PROFILE,
      setPalate: palate => set({ palate }),
      markWelcomeSeen: () => set({ welcomeSeen: true }),
      markPalateDone: () => set({ palateDone: true }),
      setProfile: profile => set({ profile }),
    }),
    {
      name: 'ildivino-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        palate: state.palate,
        points: state.points,
        welcomeSeen: state.welcomeSeen,
        palateDone: state.palateDone,
        profile: state.profile,
      }),
      /*
        Histórico de versões (bugs que só aparecem em quem JÁ usava o app, nunca
        em instalação limpa — por isso cada salto tem de continuar tratado):

        v1: `profile` passou a existir. Sem migração, quem já tinha estado gravado
            hidratava `profile` indefinido e `/personal-data` quebrava ao ler
            `profile.name`.
        v2: `onboarded` virou `welcomeSeen` + `palateDone` (login entrou no meio).
            Quem já fez o quiz não pode ver slide nem quiz de novo — mas VAI ver o
            login, porque sessão não existia antes e não há o que inventar.
      */
      version: 2,
      migrate: persisted => {
        const state = (persisted ?? {}) as Partial<UserState> & {
          onboarded?: boolean;
        };
        const { onboarded, ...rest } = state;

        return {
          ...rest,
          profile: state.profile ?? DEFAULT_PROFILE,
          welcomeSeen: state.welcomeSeen ?? onboarded ?? false,
          palateDone: state.palateDone ?? onboarded ?? false,
        };
      },
    },
  ),
);
