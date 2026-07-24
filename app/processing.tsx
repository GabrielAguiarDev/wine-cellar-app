import { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';

import { Box, Screen, Text } from '@components/index';
import { fonts } from '@theme/index';

// O cheers-wine.json tem ~10,7s (320 frames @ 29.97fps). Aceleramos para um
// loader de ~3s. `SAFETY_MS` garante a navegação caso onAnimationFinish falhe.
const SPEED = 3.5;
const SAFETY_MS = 5000;

/**
 * Tela de "processando pagamento": toca o Lottie de brinde e, ao terminar,
 * segue para o acompanhamento do pedido. Entra via `router.replace` do
 * checkout (sem voltar para o checkout).
 */
export default function ProcessingScreen() {
  const router = useRouter();
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) {
      return;
    }
    done.current = true;
    router.replace('/tracking');
  }, [router]);

  useEffect(() => {
    const t = setTimeout(finish, SAFETY_MS);
    return () => clearTimeout(t);
  }, [finish]);

  return (
    <Screen>
      <StatusBar style="dark" />
      <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="s40">
        <LottieView
          source={require('../assets/lottie/cheers-wine.json')}
          autoPlay
          loop={false}
          speed={SPEED}
          onAnimationFinish={finish}
          style={{ width: 240, height: 240 }}
        />
        <Text variant="eyebrow" marginTop="s6">
          Processando pagamento
        </Text>
        <Text
          color="primary"
          textAlign="center"
          marginTop="s8"
          style={{ fontFamily: fonts.serifSemiBold, fontSize: 27, lineHeight: 30 }}>
          Preparando seu brinde…
        </Text>
        <Text
          variant="body"
          fontSize={12.5}
          color="inkA55"
          textAlign="center"
          marginTop="s8">
          Confirmando o pagamento com segurança.
        </Text>
      </Box>
    </Screen>
  );
}
