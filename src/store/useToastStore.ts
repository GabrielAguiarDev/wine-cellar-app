import { create } from 'zustand';

const DURATION_MS = 2200;

type ToastState = {
  message: string;
  show: (message: string) => void;
  hide: () => void;
};

let timer: ReturnType<typeof setTimeout> | undefined;

/** Toast global com auto-dismiss (~2,2s). */
export const useToastStore = create<ToastState>(set => ({
  message: '',
  show: message => {
    if (timer) clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: '' }), DURATION_MS);
  },
  hide: () => {
    if (timer) clearTimeout(timer);
    set({ message: '' });
  },
}));
