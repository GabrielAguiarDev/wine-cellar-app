import { useRouter } from 'expo-router';

import {
  AnimatedHeaderScrollView,
  BackButton,
  Blip,
  Box,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import {
  orderLines,
  ordersByMonth,
  ordersSummary,
  type Order,
} from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { useCartStore, useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brl } from '@utils/format';
import {
  ORDER_STATUS_LABEL,
  formatOrderDate,
  isOrderOpen,
  orderMonthLabel,
  type OrderStatus,
} from '@utils/order';

/**
 * Cor do status. `canceled` usa `error` (o único vermelho fora da marca no tema)
 * e `delivered` fica NEUTRO de propósito: entregue é o estado esperado de quase
 * todo pedido antigo, e pintar a lista inteira de dourado tiraria o destaque de
 * quem realmente precisa dele — o pedido que ainda está a caminho.
 */
const STATUS_COLOR: Record<OrderStatus, 'accentDark' | 'inkA50' | 'error'> = {
  transit: 'accentDark',
  preparing: 'accentDark',
  delivered: 'inkA50',
  canceled: 'error',
};

/**
 * Pedidos — push da Stack raiz, aberta do "Ver todos" do Perfil.
 *
 * ── O que uma tela de histórico deve ─────────────────────────────────────────
 *
 * 1. **Agrupar por mês.** Uma lista corrida de pedidos não responde à pergunta
 *    que se faz a um histórico ("quando foi que eu comprei aquele?"). O cabeçalho
 *    de mês é a única navegação de que a tela precisa — sem filtro, sem busca:
 *    são poucos pedidos por ano, e rolar é mais rápido que filtrar.
 * 2. **Mostrar os RÓTULOS, não só o número do pedido.** Ninguém reconhece
 *    "ILD-2571"; todo mundo reconhece "Notte Eterna". O número existe para citar
 *    no atendimento, então fica, mas em segundo plano.
 * 3. **Terminar em ação.** Histórico só de leitura é arquivo morto: pedido aberto
 *    leva ao acompanhamento, pedido entregue oferece **"Comprar de novo"** — que é
 *    a razão pela qual alguém abre o histórico de uma adega, repetir o vinho que
 *    deu certo. Cancelado não oferece nada.
 */
export default function OrdersScreen() {
  const router = useRouter();
  const goBack = useGoBack('/profile');
  const show = useToastStore(s => s.show);
  const addToCart = useCartStore(s => s.addToCart);

  const months = ordersByMonth();
  const { count, spent, firstYear } = ordersSummary();

  const buyAgain = (order: Order) => {
    const lines = orderLines(order);
    lines.forEach(line => addToCart(line.wineId, line.qty));
    show(
      lines.length === 1
        ? `${lines[0]!.name} na sacola.`
        : `${lines.length} rótulos na sacola.`,
    );
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AnimatedHeaderScrollView
        largeTitle="Pedidos"
        subtitle={`${count} pedidos desde ${firstYear} · ${brl(spent)}`}
        leftComponent={<BackButton onPress={goBack} />}>
        <Box paddingBottom="s108">
          {months.map(month => (
            <Box key={month.key} marginTop="s20">
              <Text
                variant="label"
                fontSize={9.5}
                color="inkA55"
                marginHorizontal="s22"
                marginBottom="s10"
                style={{ letterSpacing: 2 }}>
                {orderMonthLabel(month.key)}
              </Text>

              <Box marginHorizontal="s22" style={{ gap: 12 }}>
                {month.orders.map(order => {
                  const lines = orderLines(order);
                  const open = isOrderOpen(order.status);
                  const canceled = order.status === 'canceled';

                  return (
                    <Box
                      key={order.id}
                      backgroundColor="surface"
                      borderWidth={1}
                      borderColor={open ? 'goldA50' : 'inkBorder09'}
                      borderRadius="r14"
                      paddingTop="s16"
                      paddingHorizontal="s16">
                      {/* cabeçalho: número, data e status */}
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        style={{ gap: 12 }}>
                        <Text
                          variant="body"
                          fontSize={11}
                          color="inkA50"
                          style={{ letterSpacing: 0.6 }}>
                          {order.id} · {formatOrderDate(order.date)}
                        </Text>
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          style={{ gap: 6 }}>
                          {open && <Blip size={6} color={palette.gold} />}
                          <Text
                            variant="label"
                            fontSize={9}
                            color={STATUS_COLOR[order.status]}
                            style={{ letterSpacing: 1.4 }}>
                            {ORDER_STATUS_LABEL[order.status]}
                          </Text>
                        </Box>
                      </Box>

                      {/* rótulos do pedido */}
                      <Box marginTop="s12" style={{ gap: 6 }}>
                        {lines.map(line => (
                          <TouchableOpacityBox
                            key={line.wineId}
                            accessibilityRole="button"
                            accessibilityLabel={`Ver ${line.name}`}
                            activeOpacity={0.7}
                            onPress={() =>
                              router.navigate(`/product/${line.wineId}`)
                            }
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                            style={{ gap: 12 }}>
                            <Text
                              variant="wineNameSm"
                              color="primary"
                              numberOfLines={1}
                              style={{ flex: 1 }}>
                              {line.name}
                            </Text>
                            {line.qty > 1 && (
                              <Text variant="body" fontSize={11} color="inkA50">
                                {line.qty} garrafas
                              </Text>
                            )}
                          </TouchableOpacityBox>
                        ))}
                      </Box>

                      {/* total + ação */}
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        marginTop="s14"
                        paddingTop="s12"
                        paddingBottom="s14"
                        borderTopWidth={1}
                        borderTopColor="inkBorder09"
                        style={{ gap: 12 }}>
                        <Text
                          color={canceled ? 'inkA50' : 'primary'}
                          style={{
                            fontFamily: fonts.serifRegular,
                            fontSize: 17,
                            textDecorationLine: canceled
                              ? 'line-through'
                              : 'none',
                          }}>
                          {brl(order.total)}
                        </Text>

                        {open && (
                          <TouchableOpacityBox
                            accessibilityRole="button"
                            accessibilityLabel={`Acompanhar o pedido ${order.id}`}
                            activeOpacity={0.85}
                            onPress={() => router.navigate('/tracking')}
                            backgroundColor="primary"
                            borderRadius="r9"
                            paddingVertical="s10"
                            paddingHorizontal="s16">
                            <Text
                              variant="label"
                              fontSize={9.5}
                              color="textOnDark"
                              style={{ letterSpacing: 1.4 }}>
                              Acompanhar
                            </Text>
                          </TouchableOpacityBox>
                        )}

                        {order.status === 'delivered' && lines.length > 0 && (
                          <TouchableOpacityBox
                            accessibilityRole="button"
                            accessibilityLabel={`Comprar de novo o pedido ${order.id}`}
                            activeOpacity={0.85}
                            onPress={() => buyAgain(order)}
                            borderWidth={1}
                            borderColor="primary"
                            borderRadius="r9"
                            paddingVertical="s10"
                            paddingHorizontal="s16">
                            <Text
                              variant="label"
                              fontSize={9.5}
                              color="primary"
                              style={{ letterSpacing: 1.4 }}>
                              Comprar de novo
                            </Text>
                          </TouchableOpacityBox>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}

          {/* nota */}
          <Box marginHorizontal="s22" marginTop="s24">
            <Text
              variant="body"
              fontSize={11}
              color="inkA50"
              style={{ lineHeight: 17 }}>
              Guardamos suas notas fiscais por cinco anos. Para segunda via ou
              dúvida sobre um pedido, cite o número dele no atendimento.
            </Text>
          </Box>
        </Box>
      </AnimatedHeaderScrollView>
    </Box>
  );
}
