import { ScrollView } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  BlocoCuradoria,
  Box,
  Icon,
  Pill,
  Reaparecer,
  ReentradaEmFade,
  Screen,
  SectionTitle,
  Text,
  TouchableOpacityBox,
  WineCard,
  WineRow,
} from '@components/index';
import {
  CAT_ESPECIAIS,
  CURADORIA_SEMANA,
  railMaisVendidos,
  railSelecionados,
} from '@data/index';
import { useFavoritesStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { nf, toWineCardData, toWineRowData } from '@utils/index';

const CATS: { label: string; val: string | null }[] = [
  { label: 'Todos', val: null },
  { label: 'Tinto', val: 'Tinto' },
  { label: 'Branco', val: 'Branco' },
  { label: 'Rosé', val: 'Rosé' },
  { label: 'Espumante', val: 'Espumante' },
];

export default function HomeScreen() {
  const router = useRouter();
  const favs = useFavoritesStore(s => s.favs);
  const toggleFav = useFavoritesStore(s => s.toggleFav);

  const selecionados = railSelecionados();
  const maisVendidos = railMaisVendidos();

  const goCat = (cat: string | null) =>
    router.navigate(cat ? { pathname: '/search', params: { cat } } : '/search');
  const goEspeciais = () =>
    router.navigate({ pathname: '/search', params: { cat: CAT_ESPECIAIS } });
  /**
   * Destino do bloco de curadoria. Rota fora de `(tabs)` (push da Stack raiz)
   * → tela cheia, sem tab bar. É daqui que a shared element transition parte:
   * o `BlocoCuradoria` mede o card antes de deixar esta navegação rolar.
   */
  const goCuradoria = () =>
    router.navigate({
      pathname: '/curadoria/[id]',
      params: { id: CURADORIA_SEMANA.id },
    });
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    <Screen scroll>
      {/*
        A rota da curadoria não tem animação de Stack (quem anima é o card),
        então também não há animação de pop: na volta, tudo o que está AO REDOR
        do card reapareceria de um frame para o outro. O `ReentradaEmFade` faz
        esses elementos voltarem em fade curto e escalonado, de cima para
        baixo. O card fica de fora de propósito — é sobre ele que a forma
        encolhe, então precisa estar em opacidade cheia no primeiro frame.
      */}
      <ReentradaEmFade transitionId={CURADORIA_SEMANA.id}>
        <Box paddingBottom="s108">
          {/* header */}
          <Reaparecer ordem={0}>
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="s22"
              paddingTop="s6"
              paddingBottom="s14">
              {/* spacer à esquerda p/ manter o logo centralizado (mesma largura do ícone à direita) */}
              <Box width={21 + 8} />
              <Box alignItems="center">
                <Text
                  style={{
                    fontFamily: fonts.serifSemiBold,
                    fontSize: 22,
                    letterSpacing: 2.6,
                    color: palette.wine,
                  }}>
                  IL DIVINO
                </Text>
                <Text
                  variant="eyebrow"
                  fontSize={8}
                  marginTop="s2"
                  style={{ letterSpacing: 3.2 }}>
                  Adega Prime
                </Text>
              </Box>
              <TouchableOpacityBox
                accessibilityLabel="Favoritos"
                activeOpacity={0.7}
                padding="s4"
                onPress={() => router.navigate('/favorites')}>
                <Icon name="heart" size={21} color={palette.wine} />
              </TouchableOpacityBox>
            </Box>
          </Reaparecer>

          {/* busca (fake) */}
          <Reaparecer ordem={1}>
            <TouchableOpacityBox
              activeOpacity={0.8}
              onPress={() => router.navigate('/search')}
              marginHorizontal="s22"
              marginBottom="s22"
              flexDirection="row"
              alignItems="center"
              backgroundColor="surface"
              borderWidth={1}
              borderColor="inkBorder14"
              borderRadius="r12"
              paddingVertical="s12"
              paddingHorizontal="s16"
              style={{ gap: 10 }}>
              <Icon name="search" size={16} color={palette.mutedIcon} />
              <Text variant="body" fontSize={13.5} color="inkA50">
                Buscar vinho ou prato…
              </Text>
            </TouchableOpacityBox>
          </Reaparecer>

          {/* banner curadoria — a MESMA peça visual da tela /curadoria/[id], aqui
              em `variante="card"`. Ao tocar (no bloco ou no CTA) a forma cresce
              até virar a tela cheia: ver src/components/BlocoCuradoria.tsx. */}
          <Box marginHorizontal="s22" marginBottom="s24">
            <BlocoCuradoria
              variante="card"
              transitionId={CURADORIA_SEMANA.id}
              eyebrow={CURADORIA_SEMANA.eyebrow}
              titulo={CURADORIA_SEMANA.titulo}
              subtitulo={CURADORIA_SEMANA.subtitulo}
              botaoLabel={CURADORIA_SEMANA.botaoLabel}
              cores={CURADORIA_SEMANA.cores}
              onPress={goCuradoria}
            />
          </Box>

          {/* pills */}
          <Reaparecer ordem={2}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 22, gap: 9 }}>
              {CATS.map(c => (
                <Pill
                  key={c.label}
                  label={c.label}
                  active={c.val === null}
                  onPress={() => goCat(c.val)}
                />
              ))}
            </ScrollView>
          </Reaparecer>

          {/* rail selecionados */}
          <Reaparecer ordem={3}>
            <Box marginTop="s30">
              <Box paddingHorizontal="s22" marginBottom="s14">
                <SectionTitle>Selecionados para você</SectionTitle>
              </Box>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 22, gap: 16 }}>
                {selecionados.map(w => (
                  <WineCard
                    key={w.id}
                    data={toWineCardData(w, !!favs[w.id])}
                    onPress={() => openWine(w.id)}
                    onToggleFav={() => toggleFav(w.id)}
                  />
                ))}
              </ScrollView>
            </Box>
          </Reaparecer>

          {/* coleção reservada */}
          <Reaparecer ordem={4}>
            <TouchableOpacityBox
              activeOpacity={0.9}
              onPress={goEspeciais}
              marginTop="s30"
              marginHorizontal="s22"
              borderRadius="r16"
              overflow="hidden"
              borderWidth={1}
              borderColor="goldA35">
              <LinearGradient
                colors={[palette.wineDeep, palette.wine]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 18,
                }}>
                <Box flex={1}>
                  <Text variant="eyebrow" marginBottom="s8">
                    Coleção reservada
                  </Text>
                  <Text
                    color="textOnDark"
                    style={{
                      fontFamily: fonts.serifSemiBold,
                      fontSize: 26,
                      lineHeight: 28,
                    }}>
                    Vinhos raros & especiais
                  </Text>
                  <Text
                    variant="body"
                    fontSize={11.5}
                    color="cremeA60"
                    marginTop="s8"
                    style={{ lineHeight: 17 }}>
                    Garrafas de edição limitada, com vídeo do sommelier.
                  </Text>
                </Box>
                <Box
                  width={34}
                  height={34}
                  borderRadius="rFull"
                  borderWidth={1}
                  borderColor="goldA60"
                  alignItems="center"
                  justifyContent="center">
                  <Icon name="arrowRight" size={12} color={palette.gold} />
                </Box>
              </LinearGradient>
            </TouchableOpacityBox>
          </Reaparecer>

          {/* rail mais vendidos */}
          <Reaparecer ordem={5}>
            <Box marginTop="s32">
              <Box paddingHorizontal="s22" marginBottom="s14">
                <SectionTitle>Mais vendidos</SectionTitle>
              </Box>
              <Box paddingHorizontal="s22" style={{ gap: 14 }}>
                {maisVendidos.map(w => (
                  <WineRow
                    key={w.id}
                    data={toWineRowData(w)}
                    subtitle={`★ ${nf(w.notaMedia)} · ${w.totalAvaliacoes} avaliações`}
                    onPress={() => openWine(w.id)}
                  />
                ))}
              </Box>
            </Box>
          </Reaparecer>

          {/* rodapé */}
          <Reaparecer ordem={6}>
            <Text
              textAlign="center"
              marginTop="s40"
              color="wineA50"
              style={{ fontFamily: fonts.serifMediumItalic, fontSize: 15 }}>
              — curadoria IL DiVino —
            </Text>
          </Reaparecer>
        </Box>
      </ReentradaEmFade>
    </Screen>
  );
}
