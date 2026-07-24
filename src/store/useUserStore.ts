import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserState = {
  /** Resultado do quiz de paladar (default 'encorpado'). */
  paladar: string;
  /** Pontos de fidelidade. */
  points: number;
  /** True após concluir/pular o quiz de preferências (1º acesso). */
  onboarded: boolean;
  setPaladar: (paladar: string) => void;
  /** Marca o onboarding como concluído (chamado ao fim do quiz). */
  completeOnboarding: () => void;
};

/**
 * Preferências e fidelidade do usuário. Persistido em AsyncStorage para que o
 * quiz de paladar só apareça no primeiro acesso.
 */
export const useUserStore = create<UserState>()(
  persist(
    set => ({
      paladar: 'encorpado',
      points: 320,
      onboarded: false,
      setPaladar: paladar => set({ paladar }),
      completeOnboarding: () => set({ onboarded: true }),
    }),
    {
      name: 'ildivino-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        paladar: state.paladar,
        points: state.points,
        onboarded: state.onboarded,
      }),
    },
  ),
);
