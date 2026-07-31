import { useState } from 'react';

import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  BackButton,
  Box,
  Button,
  Screen,
  Text,
  TextField,
} from '@components/index';
import {
  AUTH_ERROR_MESSAGE,
  MOCK_OTP_CODE,
  formatOtpCode,
  isOtpCodeComplete,
  maskOtpDestination,
  resolveGateRoute,
} from '@domain/auth';
import { useGoBack } from '@hooks/useGoBack';
import { useAuthStore, useToastStore, useUserStore } from '@store/index';
import { palette } from '@theme/index';

/**
 * Confirmação do código.
 *
 * ⚠️ **ESQUELETO — a interface ainda não foi desenhada.** Vai virar seis casas
 * separadas (o padrão de OTP), com colagem do SMS e foco automático; hoje é um
 * campo numérico só, para o fluxo fechar.
 *
 * O que NÃO é provisório:
 *  • **sem desafio em aberto, esta rota não existe** — quem chega aqui por deep
 *    link ou depois de o desafio morrer volta para `/sign-in`. O desafio não é
 *    persistido de propósito (ver `OtpChallenge`), então relaunch cai aqui;
 *  • o destino aparece MASCARADO (`maskOtpDestination`): confirma para a pessoa
 *    para onde o código foi sem escancarar o contato dela na tela;
 *  • reenviar volta para `/code` em vez de repetir o pedido no lugar — quem pede
 *    outro código quase sempre errou o endereço, e ali ele pode ser corrigido.
 */
export default function VerifyScreen() {
  const router = useRouter();
  const goBack = useGoBack('/code');
  const show = useToastStore(s => s.show);

  const challenge = useAuthStore(s => s.challenge);
  const verifyOtp = useAuthStore(s => s.verifyOtp);
  const status = useAuthStore(s => s.status);
  const palateDone = useUserStore(s => s.palateDone);

  const [code, setCode] = useState('');

  if (!challenge) {
    return <Redirect href="/sign-in" />;
  }

  const complete = isOtpCodeComplete(code, challenge.length);
  const busy = status === 'authenticating';

  const confirm = async () => {
    const ok = await verifyOtp(code);

    if (!ok) {
      const errorCode = useAuthStore.getState().error;
      show(AUTH_ERROR_MESSAGE[errorCode ?? 'unknown'], 'error');
      setCode('');
      return;
    }

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
        style={{ gap: 18 }}>
        <Box alignSelf="flex-start" marginBottom="s16">
          <BackButton variant="dark" onPress={goBack} />
        </Box>

        <Text variant="h2" color="textOnDark">
          Seu código
        </Text>
        <Text variant="body" color="cremeA60">
          Enviamos para {maskOtpDestination(challenge.destination)}.{'\n'}
          Esqueleto — no mock o código é {MOCK_OTP_CODE}.
        </Text>

        <TextField
          label={`Código de ${challenge.length} dígitos`}
          value={code}
          onChangeText={value =>
            setCode(formatOtpCode(value, challenge.length))
          }
          placeholder="000000"
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          maxLength={challenge.length}
          returnKeyType="done"
          onSubmitEditing={() => complete && confirm()}
        />

        <Box flex={1} />

        <Button
          label="Confirmar"
          variant="outlineGold"
          fullWidth
          disabled={!complete || busy}
          onPress={confirm}
        />
        <Button
          label="Reenviar código"
          variant="outlineGold"
          fullWidth
          disabled={busy}
          onPress={() => router.replace('/code')}
        />
      </Box>
    </Screen>
  );
}
