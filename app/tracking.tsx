import { useState } from 'react';

import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import {
  Blip,
  Box,
  Icon,
  Screen,
  ScreenHeader,
  SegmentedToggle,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { fonts, palette } from '@theme/index';

type Aba = 'status' | 'mapa';

type Etapa = {
  label: string;
  time: string;
  estado: 'feito' | 'atual' | 'futuro';
};

const ETAPAS: Etapa[] = [
  { label: 'Confirmado', time: '14:02', estado: 'feito' },
  { label: 'Preparando', time: '14:09', estado: 'feito' },
  { label: 'Saiu para entrega', time: 'Agora · 14:21', estado: 'atual' },
  { label: 'Entregue', time: '~14:46', estado: 'futuro' },
];

const ETA = 'Chega em ~25 min';

export default function TrackingScreen() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('status');

  return (
    <Screen scroll>
      <Box paddingBottom="s40" paddingTop="s6">
        <Box paddingHorizontal="s22">
          <ScreenHeader label="Início" onBack={() => router.navigate('/home')} />
        </Box>

        <Text
          color="primary"
          paddingHorizontal="s22"
          marginTop="s12"
          style={{ fontFamily: fonts.serifSemiBold, fontSize: 32 }}>
          Seu pedido a caminho
        </Text>
        <Text variant="body" fontSize={12} color="inkA60" paddingHorizontal="s22">
          Pedido #ILD-4821 · {ETA}
        </Text>

        <Box paddingHorizontal="s22" marginTop="s18" marginBottom="s18">
          <SegmentedToggle<Aba>
            value={aba}
            onChange={setAba}
            options={[
              { key: 'status', label: 'Status' },
              { key: 'mapa', label: 'Mapa' },
            ]}
          />
        </Box>

        {aba === 'status' ? (
          <Box paddingHorizontal="s30">
            {ETAPAS.map((e, i) => {
              const on = e.estado !== 'futuro';
              const isLast = i === ETAPAS.length - 1;
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
                        e.estado === 'feito'
                          ? 'primary'
                          : e.estado === 'atual'
                            ? 'accent'
                            : 'transparent'
                      }
                    />
                    {!isLast && (
                      <Box
                        width={2}
                        minHeight={34}
                        flex={1}
                        backgroundColor={e.estado === 'feito' ? 'primary' : 'inkBorder16'}
                      />
                    )}
                  </Box>
                  <Box paddingBottom="s26">
                    <Text
                      color={on ? 'textPrimary' : 'inkA50'}
                      style={{ fontFamily: fonts.serifSemiBold, fontSize: 21, lineHeight: 22 }}>
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
        ) : (
          <Box paddingHorizontal="s22">
            {/* mapa estilizado */}
            <Box
              height={300}
              borderRadius="r16"
              overflow="hidden"
              borderWidth={1}
              borderColor="inkBorder10"
              backgroundColor="mapBackground"
              position="relative">
              {/* ruas */}
              <Box
                position="absolute"
                style={{ top: '20%', left: '-10%', width: '80%', height: 5, backgroundColor: palette.gold, opacity: 0.4, transform: [{ rotate: '14deg' }] }}
              />
              <Box
                position="absolute"
                style={{ top: '52%', left: '10%', width: '90%', height: 6, backgroundColor: 'rgba(67,16,24,0.16)', transform: [{ rotate: '-8deg' }] }}
              />
              {/* rota */}
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 340 300" preserveAspectRatio="none">
                <Path
                  d="M60 250 C 120 200, 100 120, 200 100 S 300 70, 280 50"
                  stroke={palette.wine}
                  strokeWidth={2.5}
                  strokeDasharray="6 6"
                  fill="none"
                />
              </Svg>
              {/* destino */}
              <Box position="absolute" style={{ top: 34, right: 44 }}>
                <Box
                  width={14}
                  height={14}
                  backgroundColor="primary"
                  style={{ borderRadius: 8, borderBottomRightRadius: 0, transform: [{ rotate: '-45deg' }] }}
                />
              </Box>
              {/* entregador */}
              <Box position="absolute" style={{ bottom: 38, left: 44 }}>
                <Blip size={18} color={palette.gold} ringBorderColor={palette.creme} ringBorderWidth={3} />
              </Box>
            </Box>

            {/* card do entregador */}
            <Box
              marginTop="s18"
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
                  {ETA}
                </Text>
              </Box>
              <TouchableOpacityBox
                accessibilityLabel="Ligar para o entregador"
                activeOpacity={0.7}
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
          </Box>
        )}
      </Box>
    </Screen>
  );
}
