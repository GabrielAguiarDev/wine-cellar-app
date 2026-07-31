import { Platform } from 'react-native';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Box, Button, Screen, Text } from '@components/index';
import { AUTH_ERROR_MESSAGE, resolveGateRoute } from '@domain/auth';
import { useAuthStore, useToastStore, useUserStore } from '@store/index';
import { palette } from '@theme/index';

/**
 * Escolha do método de entrada.
 *
 * ⚠️ **ESQUELETO — a interface ainda não foi desenhada.** Os botões estão aqui
 * na ordem e nas condições certas; forma, marca e cópia entram depois.
 *
 * O que NÃO é provisório:
 *  • **Apple só no iOS.** Não existe folha da Apple no Android, e a diretriz da
 *    App Store (4.8) é o contrário: se há login social, Apple é obrigatório NO
 *    iOS. `Platform.OS` é a condição, não uma flag de configuração.
 *  • erro vem do store como `AuthErrorCode` e a tela só escolhe a mensagem
 *    (`AUTH_ERROR_MESSAGE`) — a tela nunca lê texto de erro de rede;
 *  • `canceled` (a pessoa fechou a folha nativa) **não** vira toast: desistir não
 *    é falha, e avisar sobre isso é o app repreendendo quem usa;
 *  • para onde ir no sucesso é `resolveGateRoute`, não `/home` fixo — pode faltar
 *    o quiz de paladar.
 */
export default function SignInScreen() {
  const router = useRouter();
  const show = useToastStore(s => s.show);

  const signInWithProvider = useAuthStore(s => s.signInWithProvider);
  const status = useAuthStore(s => s.status);
  const palateDone = useUserStore(s => s.palateDone);

  const busy = status === 'authenticating';

  const enter = async (provider: 'apple' | 'google') => {
    const ok = await signInWithProvider(provider);

    if (!ok) {
      const code = useAuthStore.getState().error;
      if (code && code !== 'canceled') {
        show(AUTH_ERROR_MESSAGE[code], 'error');
      }
      return;
    }

    // A sessão já existe neste ponto, então a guarda `guard={!session}` do layout
    // raiz também vai desmontar este grupo. Os dois caminhos consultam o mesmo
    // `resolveGateRoute` e apontam para o mesmo lugar — ver `authGate.ts`.
    router.replace(
      resolveGateRoute({ welcomeSeen: true, signedIn: true, palateDone }),
    );
  };

  return (
    <Screen gradient={[palette.wineLight, palette.wine, palette.wineDeep]}>
      <StatusBar style="light" />
      <Box
        flex={1}
        paddingHorizontal="s32"
        paddingBottom="s60"
        justifyContent="flex-end"
        style={{ gap: 14 }}>
        <Text variant="h2" color="textOnDark">
          Entrar
        </Text>
        <Text variant="body" color="cremeA60" marginBottom="s16">
          Esqueleto da tela de login — interface a definir.
        </Text>

        {Platform.OS === 'ios' && (
          <Button
            label="Continuar com Apple"
            variant="outlineGold"
            fullWidth
            disabled={busy}
            onPress={() => enter('apple')}
          />
        )}
        <Button
          label="Continuar com Google"
          variant="outlineGold"
          fullWidth
          disabled={busy}
          onPress={() => enter('google')}
        />
        <Button
          label="Entrar com código"
          variant="outlineGold"
          fullWidth
          disabled={busy}
          onPress={() => router.push('/code')}
        />
      </Box>
    </Screen>
  );
}
