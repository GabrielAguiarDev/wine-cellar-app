import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import {
  BackButton,
  Blip,
  BottleGraphic,
  Box,
  Icon,
  Screen,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { findWine } from '@data/index';
import { useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brl } from '@utils/index';

type Step = {
  label: string;
  time: string;
  status: 'done' | 'current' | 'upcoming';
};

const STEPS: Step[] = [
  { label: 'Confirmado', time: '14:02', status: 'done' },
  { label: 'Preparando', time: '14:09', status: 'done' },
  { label: 'Saiu para entrega', time: 'Agora · 14:21', status: 'current' },
  { label: 'Entregue', time: '~14:46', status: 'upcoming' },
];

const ORDER: { id: string; qty: number }[] = [
  { id: 'notte-eterna', qty: 1 },
  { id: 'lumiere-blanche', qty: 1 },
];

const ETA = 'Chega em ~25 min';
const ORDER_ID = '#ILD-4821';

const doneCount = STEPS.filter(e => e.status !== 'upcoming').length;
const currentStep = STEPS.find(e => e.status === 'current')?.label ?? '';

export default function TrackingScreen() {
  const router = useRouter();
  const show = useToastStore(s => s.show);

  const total = ORDER.reduce((acc, o) => acc + findWine(o.id).price * o.qty, 0);

  return (
    <Screen scroll>
      <Box paddingBottom="s40" paddingTop="s6">
        <Box paddingHorizontal="s22">
          <BackButton
            accessibilityLabel="Início"
            onPress={() => router.navigate('/home')}
          />
        </Box>

        <Text
          color="primary"
          paddingHorizontal="s22"
          marginTop="s12"
          style={{ fontFamily: fonts.serifSemiBold, fontSize: 32, lineHeight: 34 }}>
          Seu pedido a caminho
        </Text>
        <Text variant="body" fontSize={12} color="inkA60" paddingHorizontal="s22" marginTop="s2">
          Pedido {ORDER_ID}
        </Text>

        {/* mapa ao vivo (topo) */}
        <Box
          marginTop="s18"
          marginHorizontal="s22"
          height={230}
          borderRadius="r16"
          overflow="hidden"
          borderWidth={1}
          borderColor="inkBorder10"
          backgroundColor="mapBackground"
          position="relative">
          {/* ruas */}
          <Box
            position="absolute"
            style={{ top: '22%', left: '-10%', width: '80%', height: 5, backgroundColor: palette.gold, opacity: 0.4, transform: [{ rotate: '14deg' }] }}
          />
          <Box
            position="absolute"
            style={{ top: '56%', left: '10%', width: '90%', height: 6, backgroundColor: 'rgba(67,16,24,0.16)', transform: [{ rotate: '-8deg' }] }}
          />
          {/* rota */}
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 340 230" preserveAspectRatio="none">
            <Path
              d="M50 195 C 110 150, 95 95, 190 80 S 290 55, 275 40"
              stroke={palette.wine}
              strokeWidth={2.5}
              strokeDasharray="6 6"
              fill="none"
            />
          </Svg>
          {/* destino */}
          <Box position="absolute" style={{ top: 28, right: 44 }}>
            <Box
              width={14}
              height={14}
              backgroundColor="primary"
              style={{ borderRadius: 8, borderBottomRightRadius: 0, transform: [{ rotate: '-45deg' }] }}
            />
          </Box>
          {/* entregador */}
          <Box position="absolute" style={{ bottom: 30, left: 44 }}>
            <Blip size={18} color={palette.gold} ringBorderColor={palette.creme} ringBorderWidth={3} />
          </Box>
          {/* pill AO VIVO */}
          <Box
            position="absolute"
            top={12}
            left={12}
            flexDirection="row"
            alignItems="center"
            backgroundColor="surface"
            borderRadius="r20"
            paddingVertical="s6"
            paddingHorizontal="s12"
            style={{ gap: 7 }}>
            <Blip size={7} color={palette.gold} />
            <Text variant="label" fontSize={9} color="primary" style={{ letterSpacing: 1.4 }}>
              Ao vivo
            </Text>
          </Box>
        </Box>

        {/* ETA + progresso */}
        <Box
          marginTop="s14"
          marginHorizontal="s22"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="inkBorder10"
          borderRadius="r16"
          padding="s18">
          <Box flexDirection="row" alignItems="baseline" justifyContent="space-between">
            <Text color="primary" style={{ fontFamily: fonts.serifSemiBold, fontSize: 24 }}>
              {ETA}
            </Text>
            <Text variant="label" fontSize={10} color="accentDark" style={{ letterSpacing: 1.4 }}>
              {currentStep}
            </Text>
          </Box>
          <Box flexDirection="row" marginTop="s14" style={{ gap: 6 }}>
            {STEPS.map((e, i) => (
              <Box
                key={e.label}
                flex={1}
                height={4}
                borderRadius="r5"
                backgroundColor={i < doneCount ? 'accent' : 'inkBorder16'}
              />
            ))}
          </Box>
        </Box>

        {/* entregador */}
        <Box
          marginTop="s14"
          marginHorizontal="s22"
          flexDirection="row"
          alignItems="center"
          backgroundColor="surface"
          borderWidth={1}
          borderColor="inkBorder10"
          borderRadius="r14"
          paddingVertical="s16"
          paddingHorizontal="s18"
          style={{ gap: 14 }}>
          <Box
            width={44}
            height={44}
            borderRadius="rFull"
            backgroundColor="primary"
            alignItems="center"
            justifyContent="center">
            <Text color="textOnDark" style={{ fontFamily: fonts.serifRegular, fontSize: 18 }}>
              B
            </Text>
          </Box>
          <Box flex={1}>
            <Text variant="body" fontSize={14} style={{ fontFamily: fonts.sansMedium }}>
              Bruno · IL DiVino Express
            </Text>
            <Text variant="body" fontSize={11} color="inkA55" marginTop="s2">
              Seu entregador
            </Text>
          </Box>
          <TouchableOpacityBox
            accessibilityLabel="Ligar para o entregador"
            activeOpacity={0.7}
            onPress={() => show('Ligando para o entregador…')}
            width={40}
            height={40}
            borderRadius="rFull"
            borderWidth={1}
            borderColor="goldA60"
            alignItems="center"
            justifyContent="center">
            <Icon name="phone" size={16} color={palette.gold} />
          </TouchableOpacityBox>
        </Box>

        {/* timeline de status */}
        <Box marginTop="s28" paddingHorizontal="s22">
          <Text variant="eyebrow" marginBottom="s16">
            Status do pedido
          </Text>
          <Box paddingLeft="s8">
            {STEPS.map((e, i) => {
              const on = e.status !== 'upcoming';
              const isLast = i === STEPS.length - 1;
              return (
                <Box key={e.label} flexDirection="row" style={{ gap: 16 }}>
                  <Box alignItems="center">
                    <Box
                      width={16}
                      height={16}
                      borderRadius="rFull"
                      borderWidth={2}
                      borderColor={on ? 'primary' : 'inkBorder20'}
                      backgroundColor={
                        e.status === 'done'
                          ? 'primary'
                          : e.status === 'current'
                            ? 'accent'
                            : 'transparent'
                      }
                    />
                    {!isLast && (
                      <Box
                        width={2}
                        minHeight={30}
                        flex={1}
                        backgroundColor={e.status === 'done' ? 'primary' : 'inkBorder16'}
                      />
                    )}
                  </Box>
                  <Box paddingBottom="s22">
                    <Text
                      color={on ? 'textPrimary' : 'inkA50'}
                      style={{ fontFamily: fonts.serifSemiBold, fontSize: 19, lineHeight: 20 }}>
                      {e.label}
                    </Text>
                    <Text variant="body" fontSize={11} color="inkA50" marginTop="s4">
                      {e.time}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* itens do pedido */}
        <Box marginTop="s10" paddingHorizontal="s22">
          <Text variant="eyebrow" marginBottom="s14">
            Itens do pedido
          </Text>
          <Box style={{ gap: 12 }}>
            {ORDER.map(o => {
              const w = findWine(o.id);
              return (
                <Box key={o.id} flexDirection="row" alignItems="center" style={{ gap: 14 }}>
                  <BottleGraphic width={26} color={w.color} initials={w.initials} showCap={false} />
                  <Box flex={1}>
                    <Text variant="wineNameSm" fontSize={17} style={{ lineHeight: 19 }}>
                      {w.name}
                    </Text>
                    <Text variant="label" fontSize={8} color="inkA50" marginTop="s2" style={{ letterSpacing: 1.2 }}>
                      {o.qty} {o.qty === 1 ? 'garrafa' : 'garrafas'}
                    </Text>
                  </Box>
                  <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 15 }}>
                    {brl(w.price * o.qty)}
                  </Text>
                </Box>
              );
            })}
          </Box>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="baseline"
            marginTop="s16"
            paddingTop="s14"
            borderTopWidth={1}
            borderTopColor="inkBorder10">
            <Text variant="label" fontSize={10} color="inkA55" style={{ letterSpacing: 1.6 }}>
              Total
            </Text>
            <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 20 }}>
              {brl(total)}
            </Text>
          </Box>
        </Box>

        {/* endereço */}
        <Box marginTop="s26" marginHorizontal="s22">
          <Text variant="eyebrow" marginBottom="s12">
            Entrega
          </Text>
          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="surface"
            borderWidth={1}
            borderColor="inkBorder10"
            borderRadius="r14"
            paddingVertical="s16"
            paddingHorizontal="s18"
            style={{ gap: 14 }}>
            <Box
              width={38}
              height={38}
              borderRadius="rFull"
              borderWidth={1}
              borderColor="goldA60"
              alignItems="center"
              justifyContent="center">
              <Icon name="home" size={16} color={palette.gold} />
            </Box>
            <Box flex={1}>
              <Text variant="body" fontSize={13.5} style={{ fontFamily: fonts.sansMedium }}>
                Helena Prado · Casa
              </Text>
              <Text variant="body" fontSize={11.5} color="inkA55" marginTop="s2">
                Rua das Videiras, 240 · Porto Alegre
              </Text>
            </Box>
          </Box>
        </Box>

        {/* ajuda */}
        <TouchableOpacityBox
          activeOpacity={0.8}
          onPress={() => show('Nosso concierge entrará em contato.')}
          marginTop="s16"
          marginHorizontal="s22"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingVertical="s16"
          borderTopWidth={1}
          borderTopColor="inkBorder10">
          <Text variant="body" fontSize={13.5}>
            Precisa de ajuda com o pedido?
          </Text>
          <Icon name="chevronRight" size={12} color={palette.mutedIcon} />
        </TouchableOpacityBox>
      </Box>
    </Screen>
  );
}
