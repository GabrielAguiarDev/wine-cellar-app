import { type ReactNode } from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
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

/** Defasagem entre um elemento e o seguinte na entrada da tela. */
const STEP = 60;

/** Duração do fade de cada elemento. */
const FADE = 340;

/** Deslocamento vertical inicial de cada elemento, em px. */
const OFFSET = 12;

/**
 * Posição de cada elemento na fila da entrada, na ordem de leitura da tela.
 * Ficam juntas aqui — e não espalhadas como números soltos no JSX — porque o
 * que importa é a SEQUÊNCIA: inserir um bloco no meio é renumerar daqui para
 * baixo, e isso só é revisável com a lista inteira à vista.
 */
const ORDER = {
  rule: 0,
  eyebrow: 1,
  title: 2,
  lead: 3,
  stats: 4,
  sectionTitle: 5,
  /** As três fichas ocupam 6, 7 e 8. */
  cards: 6,
  note: 9,
  signature: 10,
} as const;

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
 * ── A entrada ───────────────────────────────────────────────────────────────
 *
 * A tela inteira nasce em cascata, de cima para baixo: a fotografia em fade
 * puro (`FadeIn` na raiz — ela é o fundo, não pode deslizar), e sobre ela cada
 * elemento subindo `OFFSET` px a cada `STEP` (ver `Reveal` e `ORDER`). Antes só
 * o bloco do título e as fichas animavam, o que dava o efeito contrário do
 * pretendido: o miolo da tela — faixa de dados, seção, nota de fechamento —
 * aparecia pronto no primeiro frame e as poucas peças animadas pareciam
 * atrasadas em relação a ele.
 *
 * A janela toda fecha em ~940ms (`ORDER.signature × STEP + FADE`). É um teto
 * deliberado: passa disso e a cascata deixa de ser a tela se apresentando para
 * virar espera.
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
      {/*
        Fade da tela inteira: é a fotografia entrando. Ela é o fundo de tudo o
        que vem por cima, então não desliza — deslizar arrastaria a cascata
        junto e nada teria referência parada.
      */}
      <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(320)}>
        <Box flex={1} backgroundColor="primaryDeep">
          <ParallaxHeaderScrollView
            image={HERO}
            compactTitle={RESERVED_COLLECTION.title}
            leftComponent={<BackButton variant="dark" onPress={goBack} />}
            overlay={
              <>
                {/* fio curto: o mesmo remate dourado das etiquetas da marca */}
                <Reveal order={ORDER.rule}>
                  <Box width={34} height={1} backgroundColor="goldA60" />
                </Reveal>
                <Reveal order={ORDER.eyebrow}>
                  <Text
                    variant="eyebrow"
                    marginTop="s16"
                    style={{ letterSpacing: 3.4 }}>
                    {RESERVED_COLLECTION.eyebrow}
                  </Text>
                </Reveal>
                <Reveal order={ORDER.title}>
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
                </Reveal>
                <Reveal order={ORDER.lead}>
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
                </Reveal>
              </>
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
                <Reveal order={ORDER.stats}>
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
                    <Stat
                      value={`★ ${nf(summary.averageRating)}`}
                      label="Média"
                    />
                  </Box>
                </Reveal>
              )}

              <Reveal order={ORDER.sectionTitle}>
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
              </Reveal>

              <Box paddingHorizontal="s22" style={{ gap: 18 }}>
                {wines.map((wine, i) => (
                  <Reveal key={wine.id} order={ORDER.cards + i}>
                    <RareWineCard
                      data={toRareWineCardData(wine)}
                      position={i + 1}
                      onPress={() => openWine(wine.id)}
                    />
                  </Reveal>
                ))}
              </Box>

              {/* nota de fechamento + saída para o sommelier */}
              <Reveal order={ORDER.note}>
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
              </Reveal>

              <Reveal order={ORDER.signature}>
                <Text
                  textAlign="center"
                  marginTop="s32"
                  color="cremeA50"
                  style={{ fontFamily: fonts.serifMediumItalic, fontSize: 15 }}>
                  — curadoria IL DiVino —
                </Text>
              </Reveal>
            </Box>
          </ParallaxHeaderScrollView>
        </Box>
      </Animated.View>
    </>
  );
}

/**
 * Um degrau da cascata de entrada: fade + subida de `OFFSET` px, atrasado em
 * `order × STEP`.
 *
 * `Easing.out(Easing.cubic)` é o que separa "elegante" de "lento": o elemento
 * cobre a maior parte da distância no início e desacelera na chegada, então a
 * cascata parece mais rápida do que os `FADE` ms que de fato dura.
 */
function Reveal({
  order,
  style,
  children,
}: {
  order: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.delay(order * STEP)
        .duration(FADE)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ transform: [{ translateY: OFFSET }] })}>
      {children}
    </Animated.View>
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
