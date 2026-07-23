import { create } from 'zustand';

type UserState = {
  /** Resultado do quiz de paladar (default 'encorpado'). */
  paladar: string;
  /** Pontos de fidelidade. */
  points: number;
  setPaladar: (paladar: string) => void;
};

/** Preferências e fidelidade do usuário (mock). */
export const useUserStore = create<UserState>(set => ({
  paladar: 'encorpado',
  points: 320,
  setPaladar: paladar => set({ paladar }),
}));
