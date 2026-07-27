import { ScrollView } from 'react-native';

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BlocoCuradoria, Box, Text, WineRow } from '@components/index';
import { findCuradoria, winesByIds } from '@data/index';
import { toWineRowData } from '@utils/index';

/**
 * Tela de destino da curadoria — o "dentro" do card da Home.
 *
 * O fundo bordô NÃO é recriado aqui: é o próprio `<BlocoCuradoria
 * variante="tela-cheia" />`, a mesma peça renderizada como card na Home
 * (`app/(tabs)/home/index.tsx`). Card e tela cheia compartilham componente,
 * cores e textos (vindos de `CURADORIAS`) e o mesmo `transitionId` — é isso
 * que faz a shared element transition funcionar sem duplicar estilo.
 *
 * A ANIMAÇÃO vive dentro do `BlocoCuradoria`: ele lê o retângulo do card
 * (medido no toque e guardado em `useTransicaoStore`) e cresce dali até a
 * tela inteira; o conteúdo entra em fade depois. Esta rota só precisa estar
 * declarada como `transparentModal` + `animation: 'none'` em `app/_layout.tsx`
 * para a Stack não animar por cima e a Home continuar visível por baixo.
 * `onBack` é chamado DEPOIS da animação de fechamento — por isso passamos
 * apenas `router.back()`, sem lógica de animação aqui.
 *
 * ── Chrome do sistema neste estado (decidido; ver também BlocoCuradoria) ────
 *  • Status bar: `light` (ícones claros sobre o bordô), visível, com o bloco
 *    desenhando por baixo dela. Na animação, trocar o estilo no INÍCIO da
 *    transição (`animated`), não ao final.
 *  • Tab bar: escondida. Esta rota é um push da Stack raiz (fora de
 *    `app/(tabs)/`), então some sozinha nos dois SOs — iOS não monta as
 *    Native Tabs aqui e a `TabBar` custom do Android só aparece nas 5 rotas
 *    de aba. Não reintroduzir a tab bar sobre este bloco.
 *  • Por isso o padding inferior é o inset de home indicator (aplicado dentro
 *    do BlocoCuradoria), e não o `s108` das telas de aba.
 */
export default function CuradoriaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const curadoria = findCuradoria(id);

  if (!curadoria) {
    return <Redirect href="/home" />;
  }

  const vinhos = winesByIds(curadoria.wineIds);
  const openWine = (wineId: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id: wineId } });

  return (
    <>
      <StatusBar style="light" />
      <BlocoCuradoria
        variante="tela-cheia"
        transitionId={curadoria.id}
        eyebrow={curadoria.eyebrow}
        titulo={curadoria.titulo}
        subtitulo={curadoria.subtitulo}
        cores={curadoria.cores}
        onBack={() => router.back()}>
        {/* Conteúdo específico da tela de destino. Fica dentro da camada de
            conteúdo do bloco (a que faz fade), nunca dentro da forma. */}
        <Box flex={1} marginTop="s28">
          <Text variant="eyebrow" color="cremeA55" marginBottom="s14">
            {vinhos.length} rótulos na coleção
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
            {vinhos.map(w => (
              <WineRow
                key={w.id}
                variant="dark"
                data={toWineRowData(w)}
                onPress={() => openWine(w.id)}
              />
            ))}
          </ScrollView>
        </Box>
      </BlocoCuradoria>
    </>
  );
}
