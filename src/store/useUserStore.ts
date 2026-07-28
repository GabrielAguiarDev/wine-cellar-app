import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserState = {
  /** Resultado do quiz de paladar (default 'encorpado'). */
  palate: string;
  /** Pontos de fidelidade. */
  points: number;
  /** True após concluir/pular o quiz de preferências (1º acesso). */
  onboarded: boolean;
  setPalate: (palate: string) => void;
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
      palate: 'encorpado',
      points: 320,
      onboarded: false,
      setPalate: palate => set({ palate }),
      completeOnboarding: () => set({ onboarded: true }),
    }),
    {
      name: 'ildivino-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        palate: state.palate,
        points: state.points,
        onboarded: state.onboarded,
      }),
    },
  ),
);
