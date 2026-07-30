import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackButton,
  Box,
  Button,
  ParallaxHeaderScrollView,
  RareWineCard,
  Text,
} from '@components/index';
import { RESERVED_COLLECTION, specials, specialsSummary } from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { fonts } from '@theme/index';
import { nf, toRareWineCardData } from '@utils/index';

/** Fotografia da adega da loja — o hero em parallax. */
const HERO = require('../assets/images/banner-loja.png');

/** Escalonamento da entrada das fichas. */
const CARD_DELAY = 90;

/**
 * Coleção reservada — os rótulos `featured` do catálogo.
 *
 * Antes o card "Vinhos raros & especiais" da Home caía em `/search?cat=__specials`:
 * a mesma lista de resultados de qualquer outra busca, com chips de filtro em
 * cima. Funcionava, mas tratava três garrafas de edição limitada como resultado
 * de consulta. Esta tela existe para apresentá-las.
 *
 * ── As três decisões visuais ────────────────────────────────────────────────
 *
 * 1. **Hero fotográfico em parallax** (`ParallaxHeaderScrollView`) com a foto da
 *    adega da própria loja. É a única tela do app com fotografia — as demais são
 *    desenhadas (garrafas procedurais, bandeiras SVG). O peso disso é o
 *    argumento: a coleção reservada é o lugar onde a adega FÍSICA aparece.
 * 2. **Corpo escuro contínuo** (`primaryDeep`). O véu da foto termina
 *    exatamente em `palette.wineDeep`, que é o fundo daqui — não existe emenda
 *    entre fotografia e conteúdo, a foto simplesmente escurece até virar tela.
 *    É também por isso que o corpo é sólido e não gradiente.
 * 3. **Fichas, não linhas** (`RareWineCard`). São três rótulos; uma lista seria
 *    varrida em dois segundos. Cada ficha traz nome em largura cheia,
 *    assinatura do sommelier, safra/nota em caixas e a garrafa num nicho
 *    retroiluminado — a citação da foto do topo dentro do card.
 *
 * ── Chrome do sistema ───────────────────────────────────────────────────────
 *  • Status bar `light`, com a foto sangrando por baixo dela (full bleed).
 *  • Tab bar escondida: é push da Stack raiz (fora de `app/(tabs)/`), então some
 *    sozinha nos dois SOs. Daí o padding inferior ser o inset do home indicator,
 *    e não o `s108` das telas de aba.
 *  • Push NORMAL (animação de card padrão da Stack) — ao contrário de
 *    `/curation/[id]`, aqui não há shared element: a origem é um banner de
 *    gradiente e o destino abre numa fotografia, não há forma comum para morfar.
 */
export default function ReservedScreen() {
  const router = useRouter();
  const goBack = useGoBack('/home');
  const insets = useSafeAreaInsets();

  const wines = specials();
  const summary = specialsSummary();

  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <>
      <StatusBar style="light" />
      <Box flex={1} backgroundColor="primaryDeep">
        <ParallaxHeaderScrollView
          image={HERO}
          compactTitle={RESERVED_COLLECTION.title}
          leftComponent={<BackButton variant="dark" onPress={goBack} />}
          overlay={
            <Animated.View entering={FadeInDown.duration(420)}>
              {/* fio curto: o mesmo remate dourado das etiquetas da marca */}
              <Box width={34} height={1} backgroundColor="goldA60" />
              <Text
                variant="eyebrow"
                marginTop="s16"
                style={{ letterSpacing: 3.4 }}>
                {RESERVED_COLLECTION.eyebrow}
              </Text>
              <Text
                color="textOnDark"
                marginTop="s10"
                style={{
                  fontFamily: fonts.serifSemiBold,
                  fontSize: 38,
                  lineHeight: 39,
                }}>
                {RESERVED_COLLECTION.title}
              </Text>
              <Text
                color="cremeA70"
                marginTop="s12"
                style={{
                  fontFamily: fonts.serifItalic,
                  fontSize: 15.5,
                  lineHeight: 22,
                }}>
                {RESERVED_COLLECTION.lead}
              </Text>
            </Animated.View>
          }>
          {/*
            Fundo OPACO obrigatório: a foto rola a meia velocidade, então o
            conteúdo passa por cima dela. Translúcido aqui, a fotografia
            apareceria atrás do texto.
          */}
          <Box
            backgroundColor="primaryDeep"
            style={{ paddingBottom: insets.bottom + 40 }}>
            {/* faixa de dados da coleção — o "13,3% / 750ml" em nível de coleção */}
            {summary && (
              <Box
                flexDirection="row"
                alignItems="center"
                marginHorizontal="s22"
                paddingVertical="s20"
                borderBottomWidth={1}
                borderBottomColor="cremeA08">
                <Stat value={String(summary.count)} label="Rótulos" />
                <StatDivider />
                <Stat
                  value={
                    summary.vintageFrom === summary.vintageTo
                      ? String(summary.vintageFrom)
                      : `${summary.vintageFrom}–${summary.vintageTo}`
                  }
                  label="Safras"
                />
                <StatDivider />
                <Stat value={`★ ${nf(summary.averageRating)}`} label="Média" />
              </Box>
            )}

            <Box paddingHorizontal="s22" marginTop="s30" marginBottom="s16">
              <Text
                color="textOnDark"
                style={{ fontFamily: fonts.serifSemiBold, fontSize: 25 }}>
                Na adega agora
              </Text>
              <Text
                variant="label"
                fontSize={8.5}
                color="cremeA50"
                marginTop="s4"
                style={{ letterSpacing: 1.6 }}>
                Reserva conferida garrafa a garrafa
              </Text>
            </Box>

            <Box paddingHorizontal="s22" style={{ gap: 18 }}>
              {wines.map((wine, i) => (
                <Animated.View
                  key={wine.id}
                  entering={FadeInDown.delay(200 + i * CARD_DELAY).duration(
                    360,
                  )}>
                  <RareWineCard
                    data={toRareWineCardData(wine)}
                    position={i + 1}
                    onPress={() => openWine(wine.id)}
                  />
                </Animated.View>
              ))}
            </Box>

            {/* nota de fechamento + saída para o sommelier */}
            <Box
              marginTop="s32"
              marginHorizontal="s22"
              padding="s22"
              borderRadius="r16"
              borderWidth={1}
              borderColor="goldA28"
              backgroundColor="cremeA05">
              <Text variant="eyebrow" style={{ letterSpacing: 2.8 }}>
                Como funciona
              </Text>
              <Text
                color="cremeA70"
                marginTop="s10"
                style={{
                  fontFamily: fonts.serifItalic,
                  fontSize: 15.5,
                  lineHeight: 23,
                }}>
                {RESERVED_COLLECTION.note}
              </Text>
              <Box marginTop="s20">
                <Button
                  label={RESERVED_COLLECTION.ctaLabel}
                  variant="outlineGold"
                  fullWidth
                  onPress={() => router.navigate('/sommelier')}
                />
              </Box>
            </Box>

            <Text
              textAlign="center"
              marginTop="s32"
              color="cremeA50"
              style={{ fontFamily: fonts.serifMediumItalic, fontSize: 15 }}>
              — curadoria IL DiVino —
            </Text>
          </Box>
        </ParallaxHeaderScrollView>
      </Box>
    </>
  );
}

/** Coluna da faixa de dados: valor serifado grande + rótulo miúdo. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Box flex={1} alignItems="center">
      <Text
        color="textOnDark"
        style={{ fontFamily: fonts.serifSemiBold, fontSize: 22 }}>
        {value}
      </Text>
      <Text
        variant="label"
        fontSize={8}
        color="cremeA50"
        marginTop="s4"
        style={{ letterSpacing: 1.8 }}>
        {label}
      </Text>
    </Box>
  );
}

function StatDivider() {
  return <Box width={1} height={30} backgroundColor="cremeA08" />;
}
