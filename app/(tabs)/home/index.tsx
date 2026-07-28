import { ScrollView } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  AnimatedHeaderScrollView,
  Box,
  CurationBlock,
  FadeReentry,
  Icon,
  Logo,
  Reappear,
  SectionTitle,
  Text,
  TouchableOpacityBox,
  WineCard,
  WineRow,
  WineTypeCard,
  type WineTypeCardData,
} from '@components/index';
import {
  CAT_SPECIALS,
  WEEKLY_CURATION,
  WINE_TYPES,
  countByType,
  railBestSellers,
  railSelected,
  unreadNotificationCount,
} from '@data/index';
import { useFavoritesStore, useNotificationsStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { nf, toWineCardData, toWineRowData } from '@utils/index';

/** Cor do líquido de cada tipo — swatch dos atalhos "Explorar por tipo". */
const TYPE_COLORS: Record<string, [string, string]> = {
  Tinto: [palette.pourRedLight, palette.pourRed],
  Branco: [palette.pourWhiteLight, palette.pourWhite],
  Rosé: [palette.pourRoseLight, palette.pourRose],
  Espumante: [palette.pourSparklingLight, palette.pourSparkling],
};

const TYPE_SHORTCUTS: (WineTypeCardData & { type: string })[] = WINE_TYPES.map(
  type => ({
    type,
    label: type,
    count: countByType(type),
    colors: TYPE_COLORS[type],
  }),
);

export default function HomeScreen() {
  const router = useRouter();
  const favs = useFavoritesStore(s => s.favs);
  const toggleFav = useFavoritesStore(s => s.toggleFav);
  const notificationsRead = useNotificationsStore(s => s.read);

  const selected = railSelected();
  const bestSellers = railBestSellers();
  const unread = unreadNotificationCount(notificationsRead);

  const goCat = (cat: string | null) =>
    router.navigate(cat ? { pathname: '/search', params: { cat } } : '/search');
  const goSpecials = () =>
    router.navigate({ pathname: '/search', params: { cat: CAT_SPECIALS } });
  /**
   * Destino do bloco de curadoria. Rota fora de `(tabs)` (push da Stack raiz)
   * → tela cheia, sem tab bar. É daqui que a shared element transition parte:
   * o `CurationBlock` mede o card antes de deixar esta navegação rolar.
   */
  const goCuration = () =>
    router.navigate({
      pathname: '/curation/[id]',
      params: { id: WEEKLY_CURATION.id },
    });
  const openWine = (id: string) =>
    router.navigate({ pathname: '/product/[id]', params: { id } });

  return (
    /*
      A rota da curadoria não tem animação de Stack (quem anima é o card),
      então também não há animação de pop: na volta, tudo o que está AO REDOR
      do card reapareceria de um frame para o outro. O `FadeReentry` faz
      esses elementos voltarem em fade curto e escalonado, de cima para
      baixo. O card fica de fora de propósito — é sobre ele que a forma
      encolhe, então precisa estar em opacidade cheia no primeiro frame.

      Ele envolve o HEADER, não só o conteúdo: o logo grande é desenhado dentro
      do `AnimatedHeaderScrollView`, e só entra no escalonamento se o provider
      estiver acima dele. Contexto resolve por posição de RENDER, não de
      criação — o `Reappear` do slot é criado aqui e renderizado lá dentro,
      já sob este provider.
    */
    <FadeReentry transitionId={WEEKLY_CURATION.id}>
      <Box flex={1} backgroundColor="background">
        {/*
          A Home usa o header direto, não via `Screen`: é a única tela que
          precisa da API completa (slots de logo + ação à direita).
        */}
        <AnimatedHeaderScrollView
          largeTitle="IL DiVino"
          // Marca não estica: sem o crescimento no overscroll do original.
          growOnOverscroll={false}
          largeTitleSlot={
            <Reappear order={0}>
              <Logo size={32} />
            </Reappear>
          }
          smallTitleSlot={<Logo size={18} tagline={false} />}
          rightComponent={
            <TouchableOpacityBox
              accessibilityLabel={
                unread === 0
                  ? 'Notificações'
                  : `Notificações, ${unread} não ${unread === 1 ? 'lida' : 'lidas'}`
              }
              activeOpacity={0.7}
              padding="s4"
              position="relative"
              onPress={() => router.navigate('/notifications')}>
              <Icon name="bell" size={21} color={palette.wine} />
              {unread > 0 && (
                <Box
                  position="absolute"
                  top={2}
                  right={0}
                  minWidth={15}
                  height={15}
                  borderRadius="rFull"
                  backgroundColor="primary"
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal="s4">
                  <Text style={{ color: palette.creme, fontSize: 9 }}>
                    {unread}
                  </Text>
                </Box>
              )}
            </TouchableOpacityBox>
          }>
          <Box paddingBottom="s108">
            {/* busca (fake) */}
            <Reappear order={1}>
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
            </Reappear>

            {/* banner curadoria — a MESMA peça visual da tela /curation/[id], aqui
              em `variant="card"`. Ao tocar (no bloco ou no CTA) a forma cresce
              até virar a tela cheia: ver src/components/CurationBlock.tsx. */}
            <Box marginHorizontal="s22" marginBottom="s24">
              <CurationBlock
                variant="card"
                transitionId={WEEKLY_CURATION.id}
                eyebrow={WEEKLY_CURATION.eyebrow}
                title={WEEKLY_CURATION.title}
                subtitle={WEEKLY_CURATION.subtitle}
                buttonLabel={WEEKLY_CURATION.buttonLabel}
                colors={WEEKLY_CURATION.colors}
                onPress={goCuration}
              />
            </Box>

            {/* atalhos por tipo — abrem a busca já filtrada (não filtram aqui) */}
            <Reappear order={2}>
              <Box paddingHorizontal="s22" marginBottom="s14">
                <SectionTitle
                  right={
                    <TouchableOpacityBox
                      accessibilityRole="button"
                      accessibilityLabel="Ver toda a coleção na busca"
                      activeOpacity={0.7}
                      onPress={() => goCat(null)}
                      flexDirection="row"
                      alignItems="center"
                      paddingVertical="s4"
                      style={{ gap: 6 }}>
                      <Text
                        variant="label"
                        fontSize={9.5}
                        color="accentDark"
                        style={{ letterSpacing: 1.5 }}>
                        Ver tudo
                      </Text>
                      <Icon name="arrowRight" size={11} color={palette.goldDark} />
                    </TouchableOpacityBox>
                  }>
                  Explorar por tipo
                </SectionTitle>
              </Box>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 22, gap: 12 }}>
                {TYPE_SHORTCUTS.map(t => (
                  <WineTypeCard key={t.type} data={t} onPress={() => goCat(t.type)} />
                ))}
              </ScrollView>
            </Reappear>

            {/* rail selecionados */}
            <Reappear order={3}>
              <Box marginTop="s30">
                <Box paddingHorizontal="s22" marginBottom="s14">
                  <SectionTitle>Selecionados para você</SectionTitle>
                </Box>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 22, gap: 16 }}>
                  {selected.map(w => (
                    <WineCard
                      key={w.id}
                      data={toWineCardData(w, !!favs[w.id])}
                      onPress={() => openWine(w.id)}
                      onToggleFav={() => toggleFav(w.id)}
                    />
                  ))}
                </ScrollView>
              </Box>
            </Reappear>

            {/* coleção reservada */}
            <Reappear order={4}>
              <TouchableOpacityBox
                activeOpacity={0.9}
                onPress={goSpecials}
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
            </Reappear>

            {/* rail mais vendidos */}
            <Reappear order={5}>
              <Box marginTop="s32">
                <Box paddingHorizontal="s22" marginBottom="s14">
                  <SectionTitle>Mais vendidos</SectionTitle>
                </Box>
                <Box paddingHorizontal="s22" style={{ gap: 14 }}>
                  {bestSellers.map(w => (
                    <WineRow
                      key={w.id}
                      data={toWineRowData(w)}
                      subtitle={`★ ${nf(w.averageRating)} · ${w.reviewCount} avaliações`}
                      onPress={() => openWine(w.id)}
                    />
                  ))}
                </Box>
              </Box>
            </Reappear>

            {/* rodapé */}
            <Reappear order={6}>
              <Text
                textAlign="center"
                marginTop="s40"
                color="wineA50"
                style={{ fontFamily: fonts.serifMediumItalic, fontSize: 15 }}>
                — curadoria IL DiVino —
              </Text>
            </Reappear>
          </Box>
        </AnimatedHeaderScrollView>
      </Box>
    </FadeReentry>
  );
}
