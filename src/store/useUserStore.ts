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
  /** True após concluir/pular o quiz de preferências (1º acesso). */
  onboarded: boolean;
  profile: UserProfile;
  setPalate: (palate: string) => void;
  /** Marca o onboarding como concluído (chamado ao fim do quiz). */
  completeOnboarding: () => void;
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
      onboarded: false,
      profile: DEFAULT_PROFILE,
      setPalate: palate => set({ palate }),
      completeOnboarding: () => set({ onboarded: true }),
      setProfile: profile => set({ profile }),
    }),
    {
      name: 'ildivino-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        palate: state.palate,
        points: state.points,
        onboarded: state.onboarded,
        profile: state.profile,
      }),
      /*
        `version` sobe porque o estado gravado pelas versões anteriores NÃO tem
        `profile`: sem migração, quem já abriu o app hidrataria `profile`
        indefinido e a tela de dados pessoais quebraria ao ler `profile.name` —
        um bug que não aparece em instalação limpa, só em quem já usava.
      */
      version: 1,
      migrate: persisted => {
        const state = (persisted ?? {}) as Partial<UserState>;
        return { ...state, profile: state.profile ?? DEFAULT_PROFILE };
      },
    },
  ),
);
