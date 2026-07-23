import { useToastStore } from '@store/index';

import { Toast } from './Toast';

/** Renderiza o toast global (mensagem vinda da store). */
export function ToastHost() {
  const message = useToastStore(s => s.message);
  if (!message) return null;
  return <Toast message={message} />;
}
