import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackButton,
  Box,
  ParallaxHeaderScrollView,
  REVEAL_STEP,
  Reveal,
  Text,
  TouchableOpacityBox,
  WineRow,
} from '@components/index';
import { OCCASIONS, winesByIds } from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { fonts } from '@theme/index';
import { toWineRowData } from '@utils/index';

/**
 * O brinde na mesa da adega — três taças de tinto em primeiro plano, a parede de
 * garrafas retroiluminada ao fundo.
 *
 * É a única das três fotos com PESSOAS, e é por isso que ela é desta tela: o
 * sommelier não apresenta um acervo (isso é `/reserved` e `/vip`, onde a adega
 * aparece vazia), ele responde a um momento — e o momento é gente à mesa. A
 * pergunta "qual é a ocasião?" fica em cima da resposta.
 */
const HERO = require('../assets/images/wine-glass.png');

const TITLE = 'Qual é a ocasião?';

/**
 * Chamada abaixo do título. Duas versões: a de quem chega sem escolha (convite)
 * e a de quem chega por um atalho, com o momento já definido (confirmação).
 */
const LEAD = {
  open: 'Diga o momento e a casa escolhe a garrafa.',
  linked: (label: string) => `Para ${label.toLowerCase()}, a casa já escolheu.`,
} as const;

/**
 * Hero mais baixo que o das telas de coleção (380). Ali a fotografia é o
 * assunto; aqui o assunto é a ESCOLHA, e com a foto na altura cheia a grade de
 * ocasiões — a única interação da tela — nascia inteira abaixo da dobra. Em 300
 * a primeira fileira de cartões já aparece, e o resto se resolve num arrasto.
 */
const IMAGE_HEIGHT = 300;

/**
 * Posição de cada elemento na fila da entrada, na ordem de leitura da tela —
 * mesma convenção de `/reserved` e `/vip`, ver `Reveal`.
 */
const ORDER = {
  rule: 0,
  eyebrow: 1,
  title: 2,
  lead: 3,
  /** Os quatro cartões de ocasião ocupam 4, 5, 6 e 7. */
  cards: 4,
} as const;

/**
 * Sommelier virtual — escolher pela OCASIÃO, não pelo rótulo. Push da Stack
 * raiz, aberta da busca, de `/reserved` e de `/notifications`.
 *
 * ── Por que esta tela também ganhou hero fotográfico ────────────────────────
 *
 * Ela abria em gradiente bordô liso, com o título em máquina de escrever. O que
 * mudou não foi o gosto: `/reserved` e `/vip` passaram a se abrir em fotografia,
 * e as três são o mesmo gesto do app — "deixa eu te mostrar". Uma delas em fundo
 * liso lia-se como tela de outro app.
 *
 * A diferença de dosagem está no `IMAGE_HEIGHT` acima: esta é a única das três
 * que PEDE uma ação, então a foto cede altura para a grade.
 *
 * ── O que saiu: o `StaggeredText` ───────────────────────────────────────────
 *
 * Mesmo motivo de `/vip`: sobre a fotografia, com o parallax rodando, a
 * revelação caractere a caractere era um segundo efeito disputando a mesma
 * atenção — e o título do hero ainda tem de sair em fade ao rolar para dar lugar
 * ao título compacto da barra, o que fazia a máquina de escrever aparecer e
 * desaparecer no mesmo gesto. O `StaggeredText` ficou em `/quiz`, a tela sem
 * fotografia em que o texto é o único acontecimento.
 *
 * ── A lista da ocasião NÃO entra na cascata ─────────────────────────────────
 *
 * Os vinhos abaixo da grade seguem em `FadeInDown` com `key` por ocasião, e não
 * em `Reveal`: a cascata é a tela SE APRESENTANDO (atrasos contados da montagem,
 * ver `ORDER`), enquanto aquela lista é a RESPOSTA a um toque, que precisa vir
 * imediata e se refazer a cada nova escolha.
 *
 * ── Exceção: a ocasião pode chegar pronta (`?occasion=`) ────────────────────
 *
 * Os atalhos da Home e do estado vazio da busca entram aqui já com a escolha
 * feita, e isso muda duas coisas neste primeiro render:
 *
 * 1. A lista não é resposta a toque nenhum — ela faz parte da apresentação, e
 *    por isso espera a cascata terminar (`listDelay`). Sem o atraso os vinhos
 *    entravam ANTES dos cartões que explicam de onde vieram.
 * 2. A chamada do hero muda (`LEAD`): "Qual é a ocasião?" sobre uma escolha já
 *    feita é uma pergunta respondida antes de ser lida. O texto passa a
 *    CONFIRMAR o momento que veio no link — a tela responde em vez de perguntar.
 *
 * Os dois voltam ao normal no primeiro toque na grade (`select`): dali em diante
 * a escolha é de quem está aqui, não do link.
 */
export default function SommelierScreen() {
  const router = useRouter();
  const goBack = useGoBack('/home');
  const insets = useSafeAreaInsets();

  /** Ocasião vinda de fora (Home, busca). Ignorada se não existir em `OCCASIONS`. */
  const { occasion: linkedKey } = useLocalSearchParams<{ occasion?: string }>();
  const linked = OCCASIONS.some(o => o.key === linkedKey);

  const [sel, setSel] = useState<string | null>(linked ? linkedKey! : null);
  /** Continua verdadeiro só enquanto a escolha exibida é a que veio do link. */
  const [fromLink, setFromLink] = useState(linked);
  const select = (key: string) => {
    setFromLink(false);
    setSel(key);
  };
  const listDelay = fromLink
    ? (ORDER.cards + OCCASIONS.length) * REVEAL_STEP
    : 0;

  const occasion = OCCASIONS.find(o => o.key === sel);
  const wines = occasion ? winesByIds(occasion.ids) : [];
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
            imageHeight={IMAGE_HEIGHT}
            compactTitle="Sommelier virtual"
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
                    Sommelier virtual
                  </Text>
                </Reveal>
                <Reveal order={ORDER.title}>
                  <Text
                    color="textOnDark"
                    marginTop="s10"
                    style={{
                      fontFamily: fonts.serifSemiBold,
                      fontSize: 36,
                      lineHeight: 38,
                    }}>
                    {TITLE}
                  </Text>
                </Reveal>
                <Reveal order={ORDER.lead}>
                  <Text
                    color="cremeA70"
                    marginTop="s10"
                    style={{
                      fontFamily: fonts.serifItalic,
                      fontSize: 15.5,
                      lineHeight: 22,
                    }}>
                    {fromLink && occasion
                      ? LEAD.linked(occasion.label)
                      : LEAD.open}
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
              {/* grade 2x2 das ocasiões */}
              <Box
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="space-between"
                paddingHorizontal="s22"
                paddingTop="s24"
                style={{ rowGap: 12 }}>
                {OCCASIONS.map((o, i) => {
                  const active = o.key === sel;
                  return (
                    <Reveal
                      key={o.key}
                      order={ORDER.cards + i}
                      style={{ width: '48%' }}>
                      <TouchableOpacityBox
                        activeOpacity={0.85}
                        onPress={() => select(o.key)}
                        backgroundColor={active ? 'accent' : 'cremeA06'}
                        borderWidth={1}
                        borderColor={active ? 'accent' : 'goldA35'}
                        borderRadius="r14"
                        padding="s18"
                        minHeight={118}
                        justifyContent="flex-end">
                        <Text
                          color="textOnDark"
                          style={{
                            fontFamily: fonts.serifSemiBold,
                            fontSize: 22,
                            lineHeight: 23,
                          }}>
                          {o.label}
                        </Text>
                        <Text
                          variant="body"
                          fontSize={10.5}
                          color={active ? 'cremeA82' : 'cremeA60'}
                          marginTop="s6"
                          style={{ lineHeight: 15 }}>
                          {o.desc}
                        </Text>
                      </TouchableOpacityBox>
                    </Reveal>
                  );
                })}
              </Box>

              {/* vinhos da ocasião */}
              {occasion && (
                <Box paddingHorizontal="s22" paddingTop="s20">
                  <Animated.View
                    key={`${occasion.key}-label`}
                    entering={FadeInDown.delay(listDelay).duration(300)}>
                    <Text variant="eyebrow" marginBottom="s14">
                      Para &quot;{occasion.label}&quot;
                    </Text>
                  </Animated.View>
                  <Box style={{ gap: 12 }}>
                    {wines.map((w, i) => (
                      <Animated.View
                        key={`${occasion.key}-${w.id}`}
                        entering={FadeInDown.delay(
                          listDelay + 90 + i * 70,
                        ).duration(320)}>
                        <WineRow
                          variant="dark"
                          bottleWidth={30}
                          data={toWineRowData(w)}
                          onPress={() => openWine(w.id)}
                        />
                      </Animated.View>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </ParallaxHeaderScrollView>
        </Box>
      </Animated.View>
    </>
  );
}
