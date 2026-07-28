/**
 * Central de notificações (mock — como todo o resto de `@data`, vira API na
 * Fase 16). O feed é estático; o que muda em runtime é só o estado de LEITURA,
 * que vive no `useNotificationsStore` (mesma divisão de favoritos: catálogo
 * aqui, marcação do usuário no store).
 */

/** Tipo da notificação — define ícone, acento e rótulo na lista. */
export type NotificationKind =
  'curadoria' | 'pedido' | 'favorito' | 'fidelidade' | 'vip';

/**
 * Destino ao tocar, em termos de DOMÍNIO (não de rota): a tela é que traduz
 * para `router.navigate`, para o dado não conhecer a árvore do expo-router.
 *
 * Não há destino para `/curation/[id]`: aquela rota é o outro estado do card da
 * Home (shared element com `animation: 'none'`) e, sem uma origem medida, ela
 * apareceria de salto — ver `useTransitionStore`. As notificações de curadoria
 * levam à coleção reservada, que tem animação de push normal.
 */
export type NotificationTarget =
  | { type: 'wine'; id: string }
  | { type: 'reviews'; id: string }
  | { type: 'specials' }
  | { type: 'sommelier' }
  | { type: 'order' }
  | { type: 'loyalty' }
  | { type: 'vip' };

/** Seção do feed — agrupa por recência sem depender de data real. */
export type NotificationGroup = 'hoje' | 'semana' | 'antes';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Rótulo relativo de tempo (mock; com API vira `formatRelative(date)`). */
  time: string;
  group: NotificationGroup;
  target: NotificationTarget;
  /** Estado inicial de leitura — semente do `useNotificationsStore`. */
  read: boolean;
}

/** Seções na ordem em que aparecem na tela. */
export const NOTIFICATION_GROUPS: { key: NotificationGroup; label: string }[] =
  [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Esta semana' },
    { key: 'antes', label: 'Anteriores' },
  ];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'curadoria-semana',
    kind: 'curadoria',
    title: 'Curadoria da semana no ar',
    body: 'Noites de inverno, taças cheias: tintos encorpados escolhidos a dedo pelo sommelier.',
    time: 'Agora',
    group: 'hoje',
    target: { type: 'specials' },
    read: false,
  },
  {
    id: 'pedido-saiu-entrega',
    kind: 'pedido',
    title: 'Seu pedido saiu para entrega',
    body: 'Notte Eterna + 1 garrafa chegam hoje, entre 18h e 20h.',
    time: 'Há 40 min',
    group: 'hoje',
    target: { type: 'order' },
    read: false,
  },
  {
    id: 'favorito-de-volta',
    kind: 'favorito',
    title: 'Lumière Blanche voltou ao estoque',
    body: 'O branco que você salvou está disponível outra vez — poucas garrafas.',
    time: 'Há 3 h',
    group: 'hoje',
    target: { type: 'wine', id: 'lumiere-blanche' },
    read: false,
  },
  {
    id: 'pontos-creditados',
    kind: 'fidelidade',
    title: '+678 pontos creditados',
    body: 'Sua compra de 12 de julho rendeu pontos. Faltam 82 para o nível VIP.',
    time: 'Ontem',
    group: 'semana',
    target: { type: 'loyalty' },
    read: true,
  },
  {
    id: 'vip-pre-lancamento',
    kind: 'vip',
    title: 'Pré-lançamento VIP',
    body: 'Corona Reale disponível antes de todos, com vídeo do sommelier.',
    time: 'Há 2 dias',
    group: 'semana',
    target: { type: 'vip' },
    read: true,
  },
  {
    id: 'avalie-notte-eterna',
    kind: 'pedido',
    title: 'Como foi o Notte Eterna?',
    body: 'Avalie sua última compra e ganhe 15 pontos no programa de fidelidade.',
    time: 'Há 4 dias',
    group: 'semana',
    target: { type: 'reviews', id: 'notte-eterna' },
    read: true,
  },
  {
    id: 'sommelier-ocasiao',
    kind: 'curadoria',
    title: 'O sommelier tem sugestões',
    body: 'Diga a ocasião e receba garrafas escolhidas para a noite.',
    time: '12 jul',
    group: 'antes',
    target: { type: 'sommelier' },
    read: true,
  },
  {
    id: 'frete-resgatado',
    kind: 'fidelidade',
    title: 'Frete grátis resgatado',
    body: '120 pontos usados no pedido de 20 de junho.',
    time: '20 jun',
    group: 'antes',
    target: { type: 'loyalty' },
    read: true,
  },
];

/**
 * Notificações não lidas, na ordem do feed. `read` é o mapa do
 * `useNotificationsStore` (mesmo formato de `favs`/`items`).
 */
export function unreadNotifications(
  read: Record<string, boolean>,
  notifications: AppNotification[] = NOTIFICATIONS,
): AppNotification[] {
  return notifications.filter(n => !read[n.id]);
}

/** Quantidade de não lidas — badge do ícone no header da Home. */
export function unreadNotificationCount(
  read: Record<string, boolean>,
  notifications: AppNotification[] = NOTIFICATIONS,
): number {
  return unreadNotifications(read, notifications).length;
}

/** Notificações de uma seção do feed, na ordem original. */
export function notificationsByGroup(
  group: NotificationGroup,
  notifications: AppNotification[] = NOTIFICATIONS,
): AppNotification[] {
  return notifications.filter(n => n.group === group);
}
