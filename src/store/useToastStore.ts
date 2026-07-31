import { create } from 'zustand';

import { Toast, type ToastType } from '@components/molecules/Toast';

type ToastState = {
  /**
   * Exibe um toast. O `type` escolhe o ACENTO (ícone/borda) — o balão é sempre
   * o mesmo bordô, ver `Toast.skins.ts`. Sem `type`, recado neutro.
   */
  show: (message: string, type?: ToastType) => void;
};

/**
 * Ponte: mantém a API `show(message)` usada em todo o app, delegando ao Toast
 * do reacticx (montado via `ToastProviderWithViewport` no root layout). Assim
 * as chamadas existentes passam a usar o toast novo sem nenhuma alteração.
 */
export const useToastStore = create<ToastState>(() => ({
  show: (message, type = 'default') =>
    Toast.show(message, {
      type,
      position: 'top',
      duration: 2600,
    }),
}));
