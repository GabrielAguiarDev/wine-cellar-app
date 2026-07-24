import { useState } from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  Blip,
  BottleGraphic,
  Box,
  Button,
  Icon,
  PulseBar,
  Screen,
  ScreenHeader,
  StarRating,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { findWine, type Wine } from '@data/index';
import { useCartStore, useFavoritesStore, useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brl, categoriaCompleta, nf } from '@utils/index';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const show = useToastStore(s => s.show);
  const addToCart = useCartStore(s => s.addToCart);
  const favs = useFavoritesStore(s => s.favs);
  const toggleFav = useFavoritesStore(s => s.toggleFav);

  const wine = findWine(id ?? '');
  const favorito = !!favs[wine.id];
  const isReserva = wine.destaque && wine.estoqueBaixo;

  const buy = () => {
    if (isReserva) {
      show('Reservado por 24h — enviamos um lembrete antes de expirar.');
      return;
    }
    addToCart(wine.id);
    show('Adicionado à sacola.');
    router.navigate('/bag');
  };

  const goReviews = () =>
    router.navigate({ pathname: '/reviews/[id]', params: { id: wine.id } });

  const shared = {
    wine,
    favorito,
    onBack: () => router.back(),
    onToggleFav: () => toggleFav(wine.id),
    onBuy: buy,
    onReviews: goReviews,
  };

  return wine.destaque ? (
    <ProductPremium {...shared} />
  ) : (
    <ProductStandard {...shared} />
  );
}

// --- helpers de composição -------------------------------------------------

type LayoutProps = {
  wine: Wine;
  favorito: boolean;
  onBack: () => void;
  onToggleFav: () => void;
  onBuy: () => void;
  onReviews: () => void;
};

function Harmoniza({ itens, dark }: { itens: string[]; dark?: boolean }) {
  return (
    <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
      {itens.map(h => (
        <Box
          key={h}
          borderWidth={1}
          borderColor={dark ? 'goldA35' : 'inkBorder16'}
          borderRadius="r8"
          paddingVertical="s8"
          paddingHorizontal="s14">
          <Text variant="body" fontSize={11.5} color={dark ? 'cremeA82' : 'inkA65'}>
            {h}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

function ProductPremium({
  wine,
  favorito,
  onBack,
  onToggleFav,
  onBuy,
  onReviews,
}: LayoutProps) {
  const [playing, setPlaying] = useState(false);

  const footer = (
    <Box
      flexDirection="row"
      alignItems="center"
      backgroundColor="primaryDeep"
      paddingHorizontal="s26"
      paddingTop="s20"
      paddingBottom="s12"
      style={{ gap: 16 }}>
      <Box>
        <Text variant="label" fontSize={8} color="cremeA50" style={{ letterSpacing: 1.6 }}>
          Preço
        </Text>
        <Text color="textOnDark" style={{ fontFamily: fonts.serifRegular, fontSize: 28 }}>
          {brl(wine.preco)}
        </Text>
      </Box>
      <Box flex={1}>
        <Button
          label={wine.estoqueBaixo ? 'Reservar por 24h' : 'Adquirir'}
          variant="outlineGold"
          fullWidth
          onPress={onBuy}
        />
      </Box>
    </Box>
  );

  return (
    <Screen
      scroll
      gradient={[palette.wineLight, palette.wine, palette.wineDeep]}
      gradientLocations={[0, 0.46, 1]}
      footer={footer}>
      <StatusBar style="light" />
      <Box paddingHorizontal="s20" paddingBottom="s20">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <TouchableOpacityBox accessibilityLabel="Voltar" activeOpacity={0.7} onPress={onBack} padding="s6">
            <Icon name="chevronLeft" size={16} color={palette.gold} />
          </TouchableOpacityBox>
          <TouchableOpacityBox accessibilityLabel="Favoritar" activeOpacity={0.7} onPress={onToggleFav} padding="s6">
            <Icon name="heart" size={22} color={palette.gold} fill={favorito ? palette.gold : 'none'} />
          </TouchableOpacityBox>
        </Box>

        {/* nome + garrafa */}
        <Box alignItems="center" marginTop="s8">
          <Text variant="eyebrow" style={{ letterSpacing: 3.6 }}>
            Safra {wine.safra}
          </Text>
          <Text
            color="textOnDark"
            textAlign="center"
            marginTop="s8"
            style={{ fontFamily: fonts.serifSemiBold, fontSize: 60, lineHeight: 58 }}>
            {wine.nome}
          </Text>
          <Box marginTop="s16">
            <BottleGraphic
              width={96}
              cor={wine.cor}
              iniciais={wine.iniciais}
              safra={wine.safra}
              premium
              labelMode="full"
            />
          </Box>
        </Box>

        {/* categoria + rating */}
        <Box marginTop="s24" flexDirection="row" alignItems="stretch" style={{ gap: 14 }}>
          <Box width={2} backgroundColor="accent" />
          <Text
            variant="label"
            fontSize={10}
            color="cremeA82"
            style={{ letterSpacing: 2.4, lineHeight: 17 }}>
            {categoriaCompleta(wine).toUpperCase()}
          </Text>
        </Box>

        <TouchableOpacityBox
          activeOpacity={0.7}
          onPress={onReviews}
          flexDirection="row"
          alignItems="center"
          marginTop="s16"
          style={{ gap: 8 }}>
          <StarRating value={wine.notaMedia} size={14} />
          <Text variant="body" fontSize={12} color="accent">
            {nf(wine.notaMedia)} · {wine.totalAvaliacoes} avaliações
          </Text>
        </TouchableOpacityBox>

        <Text
          color="textOnDark"
          marginTop="s22"
          style={{ fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 31 }}>
          &quot;{wine.assinatura}&quot;
        </Text>

        {/* vídeo sommelier */}
        <Box marginTop="s28">
          <Text variant="eyebrow" marginBottom="s12">
            Palavra do sommelier
          </Text>
          <TouchableOpacityBox
            activeOpacity={0.9}
            onPress={() => setPlaying(p => !p)}
            height={196}
            borderRadius="r6"
            overflow="hidden"
            borderWidth={1}
            borderColor="goldA30"
            backgroundColor="videoBackdrop"
            alignItems="center"
            justifyContent="center">
            {playing ? (
              <Box alignItems="center">
                <Text variant="label" fontSize={11} color="cremeA82" style={{ letterSpacing: 2 }}>
                  Reproduzindo…
                </Text>
                <Box flexDirection="row" alignItems="flex-end" marginTop="s12" style={{ gap: 4, height: 22 }}>
                  {[14, 22, 10, 18].map((h, i) => (
                    <PulseBar key={i} height={h} delay={i * 120} duration={800 + i * 100} />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box alignItems="center">
                <Box
                  width={56}
                  height={56}
                  borderRadius="rFull"
                  borderWidth={1}
                  borderColor="goldA60"
                  alignItems="center"
                  justifyContent="center">
                  <Box marginLeft="s4">
                    <Icon name="play" size={18} color={palette.gold} />
                  </Box>
                </Box>
                <Text
                  variant="label"
                  fontSize={10}
                  color="cremeA70"
                  marginTop="s14"
                  style={{ letterSpacing: 1.8 }}>
                  Conheça o {wine.nome} · {wine.videoDur}
                </Text>
              </Box>
            )}
          </TouchableOpacityBox>
        </Box>

        {/* harmoniza */}
        <Box marginTop="s28">
          <Text variant="eyebrow" marginBottom="s12">
            Harmoniza com
          </Text>
          <Harmoniza itens={wine.harmonizacoes} dark />
        </Box>

        {/* estoque baixo */}
        {wine.estoqueBaixo && (
          <Box marginTop="s26" flexDirection="row" alignItems="center" style={{ gap: 10 }}>
            <Blip size={7} color={palette.gold} />
            <Text variant="body" fontSize={11} color="cremeA70">
              Restam poucas unidades desta safra
            </Text>
          </Box>
        )}
      </Box>
    </Screen>
  );
}

function ProductStandard({
  wine,
  favorito,
  onBack,
  onToggleFav,
  onBuy,
  onReviews,
}: LayoutProps) {
  return (
    <Screen scroll>
      <Box paddingBottom="s108">
        <Box paddingHorizontal="s20" paddingTop="s6">
          <ScreenHeader
            onBack={onBack}
            label="Voltar"
            right={
              <TouchableOpacityBox accessibilityLabel="Favoritar" activeOpacity={0.7} onPress={onToggleFav} padding="s6">
                <Icon name="heart" size={22} color={palette.wine} fill={favorito ? palette.wine : 'none'} />
              </TouchableOpacityBox>
            }
          />
        </Box>

        {/* garrafa central */}
        <Box alignItems="center" paddingTop="s24" paddingBottom="s8">
          <BottleGraphic
            width={110}
            cor={wine.cor}
            iniciais={wine.iniciais}
            safra={wine.safra}
            capColor={palette.wine}
            labelMode="full"
            labelBg={palette.cremeSurface}
          />
        </Box>

        <Box paddingHorizontal="s30" alignItems="center">
          <Text variant="eyebrow" style={{ letterSpacing: 3.6 }}>
            Safra {wine.safra}
          </Text>
          <Text
            color="primary"
            textAlign="center"
            marginTop="s8"
            style={{ fontFamily: fonts.serifSemiBold, fontSize: 44, lineHeight: 44 }}>
            {wine.nome}
          </Text>
          <Text
            color="inkA65"
            textAlign="center"
            marginTop="s4"
            style={{ fontFamily: fonts.serifItalic, fontSize: 18 }}>
            {wine.uva} · {wine.regiao}
          </Text>
          <Text
            variant="label"
            fontSize={9}
            color="inkA50"
            marginTop="s16"
            style={{ letterSpacing: 2.4 }}>
            {categoriaCompleta(wine).toUpperCase()}
          </Text>

          <TouchableOpacityBox
            activeOpacity={0.7}
            onPress={onReviews}
            flexDirection="row"
            alignItems="center"
            marginTop="s16"
            style={{ gap: 8 }}>
            <StarRating value={wine.notaMedia} size={14} />
            <Text variant="body" fontSize={12} color="accentDark">
              {nf(wine.notaMedia)} · {wine.totalAvaliacoes}
            </Text>
          </TouchableOpacityBox>

          <Text
            color="textPrimary"
            textAlign="center"
            marginTop="s22"
            style={{ fontFamily: fonts.serifItalic, fontSize: 20, lineHeight: 28, maxWidth: 300 }}>
            &quot;{wine.assinatura}&quot;
          </Text>

          <Text color="primary" marginTop="s24" style={{ fontFamily: fonts.serifRegular, fontSize: 26 }}>
            {brl(wine.preco)}
          </Text>

          <Box marginTop="s20">
            <Button label="Adquirir" variant="outline" onPress={onBuy} />
          </Box>
        </Box>

        {/* harmoniza */}
        <Box marginTop="s44" marginHorizontal="s30" paddingTop="s26" borderTopWidth={1} borderTopColor="inkBorder10">
          <Text variant="eyebrow" color="accent" marginBottom="s14">
            Harmoniza com
          </Text>
          <Harmoniza itens={wine.harmonizacoes} />
        </Box>
      </Box>
    </Screen>
  );
}
