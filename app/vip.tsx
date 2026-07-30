import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackButton,
  Box,
  ParallaxHeaderScrollView,
  Reveal,
  Text,
  WineRow,
} from '@components/index';
import { specials } from '@data/index';
import { useGoBack } from '@hooks/useGoBack';
import { fonts } from '@theme/index';
import { toWineRowData } from '@utils/index';

/**
 * O salão com a parede de garrafas retroiluminada — a MESMA adega de
 * `/reserved`, em outro enquadramento (`banner-cellar` é o corredor central em
 * 16:9; esta é a diagonal do salão, com as mesas em primeiro plano). Foi
 * escolhida assim de propósito: as duas telas de coleção mostram a mesma casa
 * sem mostrar a mesma foto, o que era o risco de repetir o hero.
 *
 * A leitura casa com o assunto: aqui os rótulos estão na parede, ainda com a
 * mesa posta e vazia — o acesso antecipado é justamente o "antes de abrir".
 */
const HERO = require('../assets/images/cellar.png');

const TITLE = 'Lançamentos antecipados';

/**
 * Posição de cada elemento na fila da entrada, na ordem de leitura da tela —
 * mesma convenção de `/reserved`, ver `Reveal`.
 */
const ORDER = {
  rule: 0,
  eyebrow: 1,
  title: 2,
  lead: 3,
  sectionTitle: 4,
  /** Cada lançamento ocupa 5, 6, 7… */
  rows: 5,
} as const;

/**
 * Acesso antecipado (nível VIP) — push da Stack raiz, aberta do Perfil ("acesso
 * antecipado") e de `/notifications`.
 *
 * ── Por que o hero fotográfico aqui ─────────────────────────────────────────
 *
 * Esta tela é a irmã estrutural de `/reserved`: mesma anatomia (eyebrow →
 * título serifado → chamada em itálico → lista de rótulos) e mesmo papel
 * editorial — apresentar uma coleção, não devolver resultados de busca. Antes
 * ela abria em gradiente bordô liso, o que a irmanava com `/quiz` (tela de
 * FERRAMENTA) e não com a coleção que ela é. O `ParallaxHeaderScrollView` põe as
 * duas coleções falando a mesma língua e passa a diferenciá-las pela fotografia,
 * não pelo texto.
 *
 * O corpo é `primaryDeep` SÓLIDO (e não o gradiente `wineLight → wine →
 * wineDeep` de antes) por duas razões que se somam: o véu da foto termina
 * exatamente em `wineDeep`, então não existe emenda entre fotografia e
 * conteúdo; e o conteúdo passa POR CIMA da foto (ela rola a meia velocidade),
 * logo o fundo precisa ser opaco de qualquer jeito.
 *
 * ── O que saiu: o `StaggeredText` ───────────────────────────────────────────
 *
 * O título era revelado caractere a caractere. Sobre a fotografia, com o
 * parallax rodando, eram dois efeitos disputando a mesma atenção — e o título
 * do hero ainda tem de sair em fade ao rolar para dar lugar ao título compacto
 * da barra, o que fazia a máquina de escrever aparecer e desaparecer no mesmo
 * gesto. Aqui ele entra na cascata `Reveal`, como em `/reserved`. O
 * `StaggeredText` ficou em `/quiz`, a tela sem fotografia em que o texto é o
 * único acontecimento.
 *
 * ── Chrome do sistema ───────────────────────────────────────────────────────
 *  • Status bar `light`, com a foto sangrando por baixo dela (full bleed).
 *  • Tab bar escondida: é push da Stack raiz (fora de `app/(tabs)/`), então some
 *    sozinha nos dois SOs. Daí o padding inferior ser o inset do home indicator,
 *    e não o `s108` das telas de aba — que era o que estava aqui antes, deixando
 *    um vão morto no fim da lista.
 */
export default function VipScreen() {
  const router = useRouter();
  const goBack = useGoBack('/profile');
  const insets = useSafeAreaInsets();

  const releases = specials();

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
            compactTitle={TITLE}
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
                    Exclusivo · Nível VIP
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
                    {TITLE}
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
                    Garrafas em pré-lançamento, liberadas para o seu nível antes
                    do público geral.
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
              {/*
                Título de seção: com o hero ocupando o topo, a lista precisa de
                uma abertura própria — sem ela as fichas começam encostadas na
                base da fotografia, como se fossem parte dela.
              */}
              <Reveal order={ORDER.sectionTitle}>
                <Box paddingHorizontal="s22" marginTop="s26" marginBottom="s16">
                  <Text
                    color="textOnDark"
                    style={{ fontFamily: fonts.serifSemiBold, fontSize: 25 }}>
                    Abre antes para você
                  </Text>
                  <Text
                    variant="label"
                    fontSize={8.5}
                    color="cremeA50"
                    marginTop="s4"
                    style={{ letterSpacing: 1.6 }}>
                    {releases.length === 1
                      ? '1 rótulo em pré-lançamento'
                      : `${releases.length} rótulos em pré-lançamento`}
                  </Text>
                </Box>
              </Reveal>

              <Box paddingHorizontal="s22" style={{ gap: 16 }}>
                {releases.map((w, i) => (
                  <Reveal key={w.id} order={ORDER.rows + i}>
                    <WineRow
                      variant="dark"
                      bottleWidth={38}
                      badge="Pré-lançamento"
                      data={toWineRowData(w, { full: false })}
                      onPress={() => openWine(w.id)}
                    />
                  </Reveal>
                ))}
              </Box>
            </Box>
          </ParallaxHeaderScrollView>
        </Box>
      </Animated.View>
    </>
  );
}
