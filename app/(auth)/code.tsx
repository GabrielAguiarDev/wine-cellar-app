import { useState } from 'react';

import { useRouter } from 'expo-router';
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
  formatOtpDestination,
  isOtpDestinationComplete,
  otpChannelOf,
} from '@domain/auth';
import { useGoBack } from '@hooks/useGoBack';
import { useAuthStore, useToastStore } from '@store/index';
import { palette } from '@theme/index';

/**
 * Para onde mandar o código: **um campo só**, e-mail ou telefone.
 *
 * ⚠️ **ESQUELETO — a interface ainda não foi desenhada.** O `TextField` está aqui
 * porque é o campo padrão do app; a forma final (fonte grande, sem rótulo, etc.)
 * entra depois.
 *
 * O que NÃO é provisório:
 *  • quem decide se aquilo é e-mail ou telefone é `otpChannelOf` (`@domain/auth`),
 *    e é isso que também move o `keyboardType` — a tela não repete a dedução;
 *  • a máscara ao vivo é `formatOtpDestination` (a MESMA de `/personal-data` no
 *    caso do telefone);
 *  • o botão só libera com o destino completo — pedir código para endereço pela
 *    metade gasta um SMS e faz a pessoa esperar por nada.
 */
export default function CodeScreen() {
  const router = useRouter();
  const goBack = useGoBack('/sign-in');
  const show = useToastStore(s => s.show);

  const requestOtp = useAuthStore(s => s.requestOtp);
  const status = useAuthStore(s => s.status);

  const [destination, setDestination] = useState('');

  const channel = otpChannelOf(destination);
  const complete = isOtpDestinationComplete(destination);
  const busy = status === 'authenticating';

  const send = async () => {
    const ok = await requestOtp(destination);

    if (!ok) {
      const code = useAuthStore.getState().error;
      show(AUTH_ERROR_MESSAGE[code ?? 'unknown'], 'error');
      return;
    }

    // `push`, não `replace`: voltar de `/verify` para corrigir o endereço é
    // exatamente o que o gesto nativo deve fazer.
    router.push('/verify');
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
          Seu contato
        </Text>
        <Text variant="body" color="cremeA60">
          Esqueleto — e-mail ou telefone, o app reconhece qual é.
        </Text>

        <TextField
          label={channel === 'email' ? 'E-mail' : 'Telefone'}
          value={destination}
          onChangeText={value => setDestination(formatOtpDestination(value))}
          placeholder="voce@email.com ou (11) 90000-0000"
          keyboardType={channel === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
          autoComplete={channel === 'email' ? 'email' : 'tel'}
          textContentType={
            channel === 'email' ? 'emailAddress' : 'telephoneNumber'
          }
          returnKeyType="send"
          onSubmitEditing={() => complete && send()}
        />

        <Box flex={1} />

        <Button
          label="Enviar código"
          variant="outlineGold"
          fullWidth
          disabled={!complete || busy}
          onPress={send}
        />
      </Box>
    </Screen>
  );
}
