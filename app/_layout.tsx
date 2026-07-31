import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplash, AppProviders, TabBar } from '@components/index';
import { ToastProviderWithViewport } from '@components/molecules/Toast';
import { useAppFonts } from '@hooks/useAppFonts';
import { useAuthStore, useUserStore } from '@store/index';
import { palette } from '@theme/index';

// Mantém o splash nativo (cor sólida bordô) visível enquanto as fontes carregam.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [splashFinished, setSplashFinished] = useState(false);

  // Etapas de entrada: quem já venceu uma não deve poder voltar a ela (nem por
  // gesto, nem por deep link) — ver as guardas na Stack abaixo.
  const welcomeSeen = useUserStore(s => s.welcomeSeen);
  const signedIn = !!useAuthStore(s => s.session);

  const ready = fontsLoaded || fontError;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AppProviders>
      <ToastProviderWithViewport>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          {/*
            ── Etapas de entrada ─────────────────────────────────────────────

            `Stack.Protected` (expo-router 57) REMOVE a rota da pilha quando o
            `guard` é falso; se a rota removida for a ativa, a navegação cai na
            rota-âncora — `index`, que é justamente o portão e reavalia tudo.

            As guardas são "esta etapa ainda pode ser visitada?", não "é a etapa
            atual?". Quem manda ir para a próxima é `resolveGateRoute`
            (`@domain/auth/authGate`), consultado tanto pelo `index` quanto pelas
            telas — os dois caminhos dão o MESMO destino, então o pior caso de
            uma corrida é um quadro em branco, nunca um destino errado.

            `quiz` NÃO é protegido de propósito: é a única etapa que faz sentido
            refazer depois (atalho do Perfil). O que impede de vê-la duas vezes
            no primeiro acesso é a flag `palateDone`, não a pilha.
          */}
          <Stack.Protected guard={!welcomeSeen}>
            <Stack.Screen name="(onboarding)" />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          {/*
            Curadoria: a tela cresce a partir do card da Home (shared element em
            `CurationBlock`), então a Stack não pode animar por cima —
            `animation: 'none'` deixa o bloco ser o único a animar.

            É um push NORMAL (`card`), NÃO um modal. Já foi `transparentModal`,
            que tinha a vantagem de manter a Home viva por baixo durante o
            crescimento; o problema é que no iOS toda tela empilhada depois de um
            modal também é apresentada como modal — a tela de produto aberta da
            coleção subia de baixo, com cantos arredondados e a tela anterior
            aparecendo no topo. `containedTransparentModal` tem o mesmo defeito, e
            `animation: 'fade'` expõe Home e destino ao mesmo tempo (some-se o
            texto do card em dobro atrás do texto que morfa).

            Em troca, o entorno da forma durante o crescimento é o `contentStyle`
            no creme da Home: perde-se o conteúdo da Home ao redor, mas a COR
            não salta e a leitura continua sendo "o card virou a tela".

            `gestureEnabled: false` porque o swipe-back da Stack pularia a
            animação de fechamento (a rota não tem animação de pop). Quem faz o
            papel dele é o ARRASTO VERTICAL do próprio bloco, que anima a saída
            — ver "Como se SAI da tela cheia" em `CurationBlock`.
          */}
          <Stack.Screen
            name="curation/[id]"
            options={{
              animation: 'none',
              contentStyle: { backgroundColor: palette.creme },
              gestureEnabled: false,
            }}
          />
          {/*
            Story do sommelier: cresce a partir do preview na tela de produto
            premium (shared element em `organisms/sommelier-story`), então de
            novo a Stack não pode animar por cima — `animation: 'none'`.

            Aqui, ao contrário da curadoria, É um `transparentModal`: a tela de
            produto continua VIVA por baixo, apenas escurecida pelo scrim do
            story, e é isso que faz a peça ler como algo que sai de dentro
            daquela tela. O defeito que tirou o `transparentModal` da curadoria
            (no iOS, tudo que é empilhado depois de um modal também é apresentado
            como modal) não nos atinge: do story não se navega para lugar nenhum
            — só se fecha.

            `gestureEnabled: false` porque o swipe-back da Stack pularia a
            animação de fechamento. Quem faz o papel dele é o ARRASTO VERTICAL
            do próprio story.
          */}
          <Stack.Screen
            name="story/[id]"
            options={{
              presentation: 'transparentModal',
              animation: 'none',
              gestureEnabled: false,
            }}
          />
        </Stack>
        {/* iOS usa Native Tabs (em (tabs)/_layout); Android usa a TabBar custom. */}
        {Platform.OS !== 'ios' && <TabBar />}
        {!splashFinished && (
          <AnimatedSplash onFinish={() => setSplashFinished(true)} />
        )}
      </ToastProviderWithViewport>
    </AppProviders>
  );
}
