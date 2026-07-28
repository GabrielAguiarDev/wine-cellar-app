import { describe, expect, it } from '@jest/globals';

import {
  NOTIFICATIONS,
  NOTIFICATION_GROUPS,
  notificationsByGroup,
  unreadNotificationCount,
  unreadNotifications,
} from '../notifications';

/** Mapa de lidos equivalente à semente do `useNotificationsStore`. */
const seed = Object.fromEntries(
  NOTIFICATIONS.filter(n => n.read).map(n => [n.id, true]),
);

describe('unreadNotifications', () => {
  it('com mapa vazio, tudo é não lido', () => {
    expect(unreadNotifications({}).length).toBe(NOTIFICATIONS.length);
  });
  it('respeita a semente do mock (read: true)', () => {
    const unread = unreadNotifications(seed);
    expect(unread.length).toBe(NOTIFICATIONS.filter(n => !n.read).length);
    expect(unread.every(n => !n.read)).toBe(true);
  });
  it('mantém a ordem do feed', () => {
    const ids = unreadNotifications({}).map(n => n.id);
    expect(ids).toEqual(NOTIFICATIONS.map(n => n.id));
  });
});

describe('unreadNotificationCount', () => {
  it('zera quando todas estão lidas', () => {
    const allRead = Object.fromEntries(NOTIFICATIONS.map(n => [n.id, true]));
    expect(unreadNotificationCount(allRead)).toBe(0);
  });
  it('conta só as não lidas', () => {
    expect(unreadNotificationCount(seed)).toBe(3);
  });
});

describe('notificationsByGroup', () => {
  it('as seções cobrem o feed inteiro, sem sobra', () => {
    const total = NOTIFICATION_GROUPS.reduce(
      (acc, g) => acc + notificationsByGroup(g.key).length,
      0,
    );
    expect(total).toBe(NOTIFICATIONS.length);
  });
  it('filtra pela seção pedida', () => {
    expect(notificationsByGroup('hoje').every(n => n.group === 'hoje')).toBe(
      true,
    );
  });
});
