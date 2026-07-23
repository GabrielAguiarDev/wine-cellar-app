import { useRouter } from 'expo-router';

import { Box, Button, Screen, Text } from '@components/index';
import { palette } from '@theme/index';

/** Stub do Quiz de paladar (Fase 4). */
export default function QuizScreen() {
  const router = useRouter();
  const goHome = () => router.replace('/home');

  return (
    <Screen
      scroll
      gradient={[palette.wineAlt, palette.wine, palette.wineDeep]}>
      <Box padding="s32" paddingTop="s78" style={{ gap: 16, minHeight: 700 }}>
        <Text variant="eyebrow" color="accent">
          Seu paladar
        </Text>
        <Text variant="h1" color="textOnDark">
          Quiz de paladar
        </Text>
        <Text variant="quote" color="cremeA70">
          As 3 perguntas do design entram aqui na Fase 4.
        </Text>
        <Box flex={1} />
        <Button label="Concluir (ir para Início)" variant="outlineGold" fullWidth onPress={goHome} />
        <Button label="Pular" variant="outlineGold" fullWidth onPress={goHome} />
      </Box>
    </Screen>
  );
}
