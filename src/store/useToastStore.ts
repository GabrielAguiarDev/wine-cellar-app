import { create } from 'zustand';

import { Toast } from '@components/molecules/Toast';
import { palette } from '@theme/index';

type ToastState = {
  /** Exibe um toast (delegado ao Toast do reacticx, com a cor da marca). */
  show: (message: string) => void;
};

/**
 * Ponte: mantém a API `show(message)` usada em todo o app, delegando ao Toast
 * do reacticx (montado via `ToastProviderWithViewport` no root layout). Assim
 * as chamadas existentes passam a usar o toast novo sem nenhuma alteração.
 */
export const useToastStore = create<ToastState>(() => ({
  show: message =>
    Toast.show(message, {
      backgroundColor: palette.wine,
      position: 'top',
      duration: 2600,
    }),
}));
