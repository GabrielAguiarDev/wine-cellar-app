import { LinearGradient } from 'expo-linear-gradient';
import { type Href, useRouter } from 'expo-router';

import {
  Accordion,
  Box,
  Button,
  Icon,
  Screen,
  SectionTitle,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { FAQ, orderWineNames, recentOrders } from '@data/index';
import { useUserStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brl } from '@utils/format';
import { ORDER_STATUS_LABEL, formatOrderDate, orderTitle } from '@utils/order';
import { initials } from '@utils/person';

const META = 500;

/** Atalhos de conta. */
const LINKS: { label: string; route?: Href }[] = [
  { label: 'Dados pessoais', route: '/personal-data' },
  { label: 'Endereços salvos', route: '/addresses' },
  { label: 'Formas de pagamento', route: '/payment-methods' },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ProfileScreen() {
  const router = useRouter();
  const points = useUserStore(s => s.points);
  const palate = useUserStore(s => s.palate);
  const name = useUserStore(s => s.profile.name);

  const remaining = META - points;
  const progressPct = Math.round((points / META) * 100);
  const tags = [cap(palate), 'Seco', 'Tintos'];

  return (
    <Screen scroll largeTitle="Perfil">
      <Box paddingBottom="s108" paddingTop="s6">
        {/* card VIP */}
        <Box
          marginHorizontal="s22"
          borderRadius="r18"
          overflow="hidden"
          borderWidth={1}
          borderColor="goldA35">
          <LinearGradient
            colors={[palette.wineDeep, palette.wine]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}>
            <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
              <Box
                width={58}
                height={58}
                borderRadius="rFull"
                borderWidth={1}
                borderColor="goldA50"
                backgroundColor="cremeA08"
                alignItems="center"
                justifyContent="center">
                <Text
                  color="textOnDark"
                  style={{ fontFamily: fonts.serifRegular, fontSize: 24 }}>
                  {initials(name)}
                </Text>
              </Box>
              <Box flex={1}>
                <Text
                  color="textOnDark"
                  numberOfLines={1}
                  style={{ fontFamily: fonts.serifSemiBold, fontSize: 26 }}>
                  {name}
                </Text>
                <Text variant="eyebrow" marginTop="s6">
                  Membro Prime
                </Text>
              </Box>
            </Box>
            <Box
              marginTop="s20"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between">
              <Box>
                <Text
                  color="textOnDark"
                  style={{ fontFamily: fonts.serifRegular, fontSize: 22 }}>
                  {points}{' '}
                  <Text color="cremeA60" fontSize={12}>
                    pontos
                  </Text>
                </Text>
                <Text
                  variant="body"
                  fontSize={10}
                  color="cremeA55"
                  marginTop="s2">
                  {remaining} pts para o nível VIP
                </Text>
              </Box>
              <Button
                label="Ver programa"
                variant="outlineGold"
                onPress={() => router.navigate('/loyalty')}
              />
            </Box>
            <Box
              marginTop="s14"
              height={5}
              borderRadius="r5"
              backgroundColor="cremeA15"
              overflow="hidden">
              <Box
                height={5}
                borderRadius="r5"
                backgroundColor="accent"
                style={{ width: `${progressPct}%` }}
              />
            </Box>
          </LinearGradient>
        </Box>

        {/* acesso antecipado */}
        <TouchableOpacityBox
          activeOpacity={0.9}
          onPress={() => router.navigate('/vip')}
          marginHorizontal="s22"
          marginTop="s14"
          flexDirection="row"
          alignItems="center"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="goldA50"
          borderRadius="r14"
          paddingVertical="s16"
          paddingHorizontal="s18"
          style={{ gap: 14 }}>
          <Box
            width={38}
            height={38}
            borderRadius="rFull"
            borderWidth={1}
            borderColor="accent"
            alignItems="center"
            justifyContent="center">
            <Icon
              name="star"
              size={16}
              color={palette.gold}
              fill={palette.gold}
            />
          </Box>
          <Box flex={1}>
            <Text variant="wineName" color="primary">
              Acesso antecipado
            </Text>
            <Text variant="body" fontSize={11} color="inkA55" marginTop="s2">
              Lançamentos VIP antes de todos
            </Text>
          </Box>
          <Icon name="chevronRight" size={13} color={palette.gold} />
        </TouchableOpacityBox>

        {/* seu paladar */}
        <Box marginHorizontal="s22" marginTop="s22">
          <SectionTitle
            right={
              <TouchableOpacityBox
                activeOpacity={0.7}
                onPress={() => router.navigate('/quiz')}>
                <Text variant="body" fontSize={11} color="accentDark">
                  Refazer
                </Text>
              </TouchableOpacityBox>
            }>
            <Text variant="sectionTitle" fontSize={21}>
              Seu palate
            </Text>
          </SectionTitle>
          <Box
            flexDirection="row"
            flexWrap="wrap"
            marginTop="s12"
            style={{ gap: 8 }}>
            {tags.map(t => (
              <Box
                key={t}
                borderWidth={1}
                borderColor="goldA50"
                borderRadius="r8"
                paddingVertical="s8"
                paddingHorizontal="s14">
                <Text
                  variant="label"
                  fontSize={10}
                  color="primary"
                  style={{ letterSpacing: 1.6 }}>
                  {t}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* pedidos recentes */}
        <Box marginHorizontal="s22" marginTop="s24">
          {/*
            "Ver todos" no lugar de só uma seta: a seta sozinha, ao lado de um
            título, é ambígua num rail — parece "avançar a lista". O rótulo diz
            que existe MAIS coisa, e a seta ao lado dele diz para onde. Mesmo par
            do "Refazer" do paladar, que já usa o slot `right` do `SectionTitle`.
          */}
          <SectionTitle
            right={
              <TouchableOpacityBox
                accessibilityRole="button"
                accessibilityLabel="Ver todos os pedidos"
                activeOpacity={0.7}
                onPress={() => router.navigate('/orders')}
                flexDirection="row"
                alignItems="center"
                style={{ gap: 6 }}>
                <Text variant="body" fontSize={11} color="accentDark">
                  Ver todos
                </Text>
                <Icon name="chevronRight" size={10} color={palette.goldDark} />
              </TouchableOpacityBox>
            }>
            <Text variant="sectionTitle" fontSize={21}>
              Pedidos recentes
            </Text>
          </SectionTitle>
          <Box marginTop="s12" style={{ gap: 10 }}>
            {recentOrders(2).map(order => (
              <TouchableOpacityBox
                key={order.id}
                accessibilityRole="button"
                accessibilityLabel={`Pedido ${order.id}, ${ORDER_STATUS_LABEL[order.status]}`}
                activeOpacity={0.85}
                onPress={() => router.navigate('/orders')}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="surface"
                borderWidth={1}
                borderColor="inkBorder09"
                borderRadius="r12"
                paddingVertical="s14"
                paddingHorizontal="s16"
                style={{ gap: 12 }}>
                <Box flex={1}>
                  <Text
                    variant="body"
                    fontSize={13}
                    numberOfLines={1}
                    style={{ fontFamily: fonts.sansMedium }}>
                    {orderTitle(orderWineNames(order))}
                  </Text>
                  <Text
                    variant="body"
                    fontSize={11}
                    color="inkA50"
                    marginTop="s2">
                    {formatOrderDate(order.date)} ·{' '}
                    {ORDER_STATUS_LABEL[order.status]}
                  </Text>
                </Box>
                <Text
                  color="primary"
                  style={{ fontFamily: fonts.serifRegular, fontSize: 16 }}>
                  {brl(order.total)}
                </Text>
              </TouchableOpacityBox>
            ))}
          </Box>
        </Box>

        {/* links */}
        <Box marginHorizontal="s22" marginTop="s22">
          {LINKS.map(l => {
            const row = (
              <>
                <Text variant="body" fontSize={14}>
                  {l.label}
                </Text>
                <Icon name="chevronRight" size={12} color={palette.mutedIcon} />
              </>
            );

            const rowProps = {
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              justifyContent: 'space-between' as const,
              paddingVertical: 's16' as const,
              borderBottomWidth: 1,
              borderBottomColor: 'inkBorder10' as const,
            };

            return l.route ? (
              <TouchableOpacityBox
                key={l.label}
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={() => router.navigate(l.route as Href)}
                {...rowProps}>
                {row}
              </TouchableOpacityBox>
            ) : (
              <Box key={l.label} {...rowProps}>
                {row}
              </Box>
            );
          })}
        </Box>

        {/* perguntas frequentes */}
        <Box marginHorizontal="s22" marginTop="s24">
          <Text variant="sectionTitle" fontSize={21} marginBottom="s12">
            Perguntas frequentes
          </Text>
          {/*
            `type="single"`: com duas respostas abertas ao mesmo tempo a lista
            fica mais alta que a tela e a pergunta que se acabou de tocar sai
            de vista. Indicador `plus` (não o chevron dos atalhos acima) para
            uma coisa que ABRE não parecer uma coisa que NAVEGA.
          */}
          <Accordion type="single">
            {FAQ.map(item => (
              <Accordion.Item key={item.id} value={item.id} indicator="plus">
                <Accordion.Trigger>{item.question}</Accordion.Trigger>
                <Accordion.Content>
                  <Text
                    variant="body"
                    fontSize={12.5}
                    color="inkA65"
                    style={{ lineHeight: 19 }}>
                    {item.answer}
                  </Text>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </Box>
      </Box>
    </Screen>
  );
}
