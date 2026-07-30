import { useRouter } from 'expo-router';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Box,
  Icon,
  Text,
  TouchableOpacityBox,
  type IconName,
} from '@components/index';
import {
  NOTIFICATION_GROUPS,
  notificationsByGroup,
  unreadNotificationCount,
  type AppNotification,
  type NotificationKind,
  type NotificationTarget,
} from '@data/index';
import { useNotificationsStore } from '@store/index';
import { fonts, palette } from '@theme/index';

/** Ícone, acento e rótulo por tipo de notificação. */
const KIND: Record<
  NotificationKind,
  { icon: IconName; color: string; fill?: string; label: string }
> = {
  curadoria: { icon: 'star', color: palette.gold, label: 'Curadoria' },
  pedido: { icon: 'bag', color: palette.wine, label: 'Pedido' },
  favorito: {
    icon: 'heart',
    color: palette.wine,
    fill: palette.wine,
    label: 'Favoritos',
  },
  fidelidade: { icon: 'gift', color: palette.gold, label: 'Fidelidade' },
  vip: { icon: 'play', color: palette.gold, label: 'VIP' },
};

/**
 * Central de notificações — push da Stack raiz (fora de `(tabs)`), então abre em
 * tela cheia, sem tab bar.
 *
 * O título grande é o do app — `AnimatedHeaderScrollView`, o mesmo das abas, que
 * colapsa na barra compacta ao rolar. Como esta é uma tela EMPILHADA, o voltar
 * entra no `leftComponent` (slot criado para cá) e o título nasce abaixo da faixa
 * da nav bar.
 *
 * O header NATIVO com `headerLargeTitleEnabled` foi tentado primeiro e no iOS 26
 * desenha só o botão voltar: o título grande não aparece nem colapsa (mesmo
 * sintoma em `/loyalty`), porque o `react-native-screens` não acha o ScrollView
 * da tela — é a armadilha documentada em `theme/navHeader.ts`.
 *
 * O feed vem de `@data` e o estado de leitura do `useNotificationsStore`: tocar
 * marca como lida e navega para o destino do domínio (`NotificationTarget`), que
 * é traduzido em rota aqui — o dado não conhece a árvore do expo-router.
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const read = useNotificationsStore(s => s.read);
  const markRead = useNotificationsStore(s => s.markRead);
  const markAllRead = useNotificationsStore(s => s.markAllRead);

  const unread = unreadNotificationCount(read);

  const go = (target: NotificationTarget) => {
    switch (target.type) {
      case 'wine':
        router.navigate({
          pathname: '/product/[id]',
          params: { id: target.id },
        });
        return;
      case 'reviews':
        router.navigate({
          pathname: '/reviews/[id]',
          params: { id: target.id },
        });
        return;
      case 'specials':
        router.navigate('/reserved');
        return;
      case 'sommelier':
        router.navigate('/sommelier');
        return;
      case 'order':
        router.navigate('/tracking');
        return;
      case 'loyalty':
        router.navigate('/loyalty');
        return;
      case 'vip':
        router.navigate('/vip');
        return;
    }
  };

  const open = (n: AppNotification) => {
    markRead(n.id);
    go(n.target);
  };

  /**
   * Aberta por deep link (`yydivinomobile://notifications`, e amanhã pelo toque
   * numa push), esta é a PRIMEIRA rota da pilha: não há para onde voltar e
   * `router.back()` não faz nada. Nesse caso o voltar vai para a Home.
   */
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate('/home');
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle="Notificações"
        leftComponent={<BackButton onPress={goBack} />}>
        <Box paddingBottom="s108">
          {/* resumo + ação de marcar todas */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="s22">
            <Text variant="body" fontSize={12} color="inkA55">
              {unread === 0
                ? 'Tudo em dia por aqui'
                : `${unread} ${unread === 1 ? 'nova notificação' : 'novas notificações'}`}
            </Text>
            {unread > 0 && (
              <TouchableOpacityBox
                activeOpacity={0.7}
                accessibilityLabel="Marcar todas como lidas"
                onPress={markAllRead}>
                <Text variant="body" fontSize={11} color="accentDark">
                  Marcar todas como lidas
                </Text>
              </TouchableOpacityBox>
            )}
          </Box>

          {NOTIFICATION_GROUPS.map(group => {
            const items = notificationsByGroup(group.key);
            if (items.length === 0) {
              return null;
            }
            return (
              <Box key={group.key} marginTop="s24" paddingHorizontal="s22">
                <Text
                  variant="label"
                  fontSize={10}
                  color="inkA50"
                  marginBottom="s12"
                  style={{ letterSpacing: 1.8 }}>
                  {group.label}
                </Text>
                <Box style={{ gap: 10 }}>
                  {items.map(n => {
                    const kind = KIND[n.kind];
                    const isUnread = !read[n.id];
                    return (
                      <TouchableOpacityBox
                        key={n.id}
                        activeOpacity={0.85}
                        accessibilityLabel={`${n.title}${isUnread ? ', não lida' : ''}`}
                        onPress={() => open(n)}
                        flexDirection="row"
                        backgroundColor={isUnread ? 'surface' : 'transparent'}
                        borderWidth={1}
                        borderColor={isUnread ? 'inkBorder14' : 'inkBorder09'}
                        borderRadius="r14"
                        paddingVertical="s16"
                        paddingHorizontal="s16"
                        style={{ gap: 14 }}>
                        <Box
                          width={38}
                          height={38}
                          borderRadius="rFull"
                          borderWidth={1}
                          borderColor={
                            kind.color === palette.gold
                              ? 'goldA50'
                              : 'inkBorder16'
                          }
                          alignItems="center"
                          justifyContent="center">
                          <Icon
                            name={kind.icon}
                            size={16}
                            color={kind.color}
                            fill={kind.fill}
                          />
                        </Box>
                        <Box flex={1}>
                          <Box
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                            marginBottom="s4">
                            <Text
                              variant="eyebrow"
                              fontSize={9}
                              color={
                                kind.color === palette.gold
                                  ? 'accent'
                                  : 'wineA60'
                              }>
                              {kind.label}
                            </Text>
                            <Text variant="body" fontSize={10.5} color="inkA50">
                              {n.time}
                            </Text>
                          </Box>
                          <Text
                            color="primary"
                            style={{
                              fontFamily: isUnread
                                ? fonts.serifSemiBold
                                : fonts.serifMedium,
                              fontSize: 19,
                              lineHeight: 22,
                            }}>
                            {n.title}
                          </Text>
                          <Text
                            variant="body"
                            fontSize={12}
                            color="inkA55"
                            marginTop="s4"
                            style={{ lineHeight: 17 }}>
                            {n.body}
                          </Text>
                        </Box>
                        {/* marcador de não lida — some ao abrir/marcar todas */}
                        <Box width={8} paddingTop="s6">
                          {isUnread && (
                            <Box
                              width={8}
                              height={8}
                              borderRadius="rFull"
                              backgroundColor="primary"
                            />
                          )}
                        </Box>
                      </TouchableOpacityBox>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
