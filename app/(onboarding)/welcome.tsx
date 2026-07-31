import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Box, Button, Screen, Text } from '@components/index';
import { resolveGateRoute } from '@domain/auth';
import { useAuthStore, useUserStore } from '@store/index';
import { palette } from '@theme/index';

/**
 * Boas-vindas do primeiro acesso.
 *
 * ⚠️ **ESQUELETO — a interface ainda não foi desenhada.** O que está aqui é o
 * mínimo para o fluxo rodar de ponta a ponta: fundo escuro de marca, um texto e
 * o CTA que conclui a etapa. Cópia, slides, ilustração e animação entram depois.
 *
 * O que NÃO é provisório e deve sobreviver ao desenho:
 *  • concluir = `markWelcomeSeen()` + navegar para `resolveGateRoute(...)`, nunca
 *    um `/sign-in` fixo — a etapa não decide qual é a próxima;
 *  • a ORDEM das duas linhas em `advance()` (ver comentário lá);
 *  • `router.replace`, nunca `push`: os slides não voltam.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const markWelcomeSeen = useUserStore(s => s.markWelcomeSeen);
  const palateDone = useUserStore(s => s.palateDone);
  const session = useAuthStore(s => s.session);

  const advance = () => {
    const next = resolveGateRoute({
      welcomeSeen: true,
      signedIn: !!session,
      palateDone,
    });

    // Navegar ANTES de marcar a flag, e não o contrário: a guarda
    // `<Stack.Protected guard={!welcomeSeen}>` do layout raiz remove este grupo
    // no instante em que a flag vira `true`. Nesta ordem, quando isso acontece a
    // rota ativa já é a próxima e o que sai da pilha é uma tela inativa.
    router.replace(next);
    markWelcomeSeen();
  };

  return (
    <Screen gradient={[palette.wineLight, palette.wine, palette.wineDeep]}>
      <StatusBar style="light" />
      <Box
        flex={1}
        paddingHorizontal="s32"
        paddingBottom="s60"
        justifyContent="flex-end"
        style={{ gap: 18 }}>
        <Text variant="h2" color="textOnDark">
          IL DiVino
        </Text>
        <Text variant="body" color="cremeA60">
          Esqueleto da tela de boas-vindas — interface a definir.
        </Text>
        <Button
          label="Começar"
          variant="outlineGold"
          fullWidth
          onPress={advance}
        />
      </Box>
    </Screen>
  );
}
