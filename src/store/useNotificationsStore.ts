import { create } from 'zustand';

import { NOTIFICATIONS } from '@data/notifications';

type NotificationsState = {
  /** Ids já lidos (mesmo formato de `favs`: mapa de presença). */
  read: Record<string, boolean>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  isRead: (id: string) => boolean;
};

/** Semente: as notificações que já nascem lidas no mock (`read: true`). */
const SEED: Record<string, boolean> = Object.fromEntries(
  NOTIFICATIONS.filter(n => n.read).map(n => [n.id, true]),
);

/**
 * Estado de LEITURA das notificações. O feed em si é estático (`@data`) — aqui
 * só fica o que o usuário marcou, como em `useFavoritesStore`. Não é persistido
 * (só `useUserStore` é); ao reabrir o app, as três não lidas voltam.
 */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  read: SEED,
  markRead: id =>
    set(s => (s.read[id] ? s : { read: { ...s.read, [id]: true } })),
  markAllRead: () =>
    set({
      read: Object.fromEntries(NOTIFICATIONS.map(n => [n.id, true])),
    }),
  isRead: id => !!get().read[id],
}));
