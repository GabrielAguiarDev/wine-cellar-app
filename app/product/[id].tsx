import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import {
  BackButton,
  Blip,
  BottleGraphic,
  Box,
  Button,
  IconButton,
  Screen,
  StarRating,
  Text,
  TouchableOpacityBox,
} from '@components/index';
import { SommelierStoryPreview } from '@components/organisms/sommelier-story';
import { findWine, type Wine } from '@data/index';
import { useCartStore, useFavoritesStore, useToastStore } from '@store/index';
import { fonts, palette } from '@theme/index';
import { brl, fullCategory, nf } from '@utils/index';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const show = useToastStore(s => s.show);
  const addToCart = useCartStore(s => s.addToCart);
  const favs = useFavoritesStore(s => s.favs);
  const toggleFav = useFavoritesStore(s => s.toggleFav);

  const wine = findWine(id ?? '');
  const favorite = !!favs[wine.id];
  const isReservation = wine.featured && wine.lowStock;

  const buy = () => {
    if (isReservation) {
      show('Reservado por 24h — enviamos um lembrete antes de expirar.');
      return;
    }
    addToCart(wine.id);
    show('Adicionado à sacola.');
    router.navigate('/bag');
  };

  const goReviews = () =>
    router.navigate({ pathname: '/reviews/[id]', params: { id: wine.id } });

  const goStory = () =>
    router.navigate({ pathname: '/story/[id]', params: { id: wine.id } });

  const shared = {
    wine,
    favorite,
    onBack: () => router.back(),
    onToggleFav: () => toggleFav(wine.id),
    onBuy: buy,
    onReviews: goReviews,
    onStory: goStory,
  };

  return wine.featured ? (
    <ProductPremium {...shared} />
  ) : (
    <ProductStandard {...shared} />
  );
}

// --- helpers de composição -------------------------------------------------

type LayoutProps = {
  wine: Wine;
  favorite: boolean;
  onBack: () => void;
  onToggleFav: () => void;
  onBuy: () => void;
  onReviews: () => void;
  /** Abrir o story do sommelier. Só o layout premium tem vídeo. */
  onStory: () => void;
};

/**
 * Topo da tela: voltar à esquerda, favoritar à direita — os dois no MESMO
 * círculo de 36 (`IconButton`). O par é o motivo de a peça existir: com o
 * voltar redondo e o coração nu, o topo lia como duas camadas diferentes.
 */
function ProductChrome({
  variant,
  favorite,
  onBack,
  onToggleFav,
}: {
  variant: 'dark' | 'light';
  favorite: boolean;
  onBack: () => void;
  onToggleFav: () => void;
}) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between">
      <BackButton variant={variant} onPress={onBack} />
      <IconButton
        icon="heart"
        variant={variant}
        accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Favoritar'}
        iconSize={17}
        filled={favorite}
        onPress={onToggleFav}
      />
    </Box>
  );
}

/**
 * Dado técnico do rótulo (safra, corpo, nota) na versão CLARA — o mesmo padrão
 * "valor serifado + rótulo miúdo" da ficha de `RareWineCard`, que lá vive na
 * variante escura sobre bordô.
 */
function SpecChip({ value, label }: { value: string; label: string }) {
  return (
    <Box
      flex={1}
      backgroundColor="surface"
      borderWidth={1}
      borderColor="inkBorder10"
      borderRadius="r11"
      paddingVertical="s10"
      paddingHorizontal="s12">
      <Text
        color="primary"
        style={{ fontFamily: fonts.serifSemiBold, fontSize: 17, lineHeight: 19 }}>
        {value}
      </Text>
      <Text
        variant="label"
        fontSize={7.5}
        color="inkA50"
        marginTop="s2"
        style={{ letterSpacing: 1.2 }}>
        {label}
      </Text>
    </Box>
  );
}

function Pairings({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <Box flexDirection="row" flexWrap="wrap" style={{ gap: 8 }}>
      {items.map(h => (
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
  favorite,
  onBack,
  onToggleFav,
  onBuy,
  onReviews,
  onStory,
}: LayoutProps) {
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
          {brl(wine.price)}
        </Text>
      </Box>
      <Box flex={1}>
        <Button
          label={wine.lowStock ? 'Reservar por 24h' : 'Adquirir'}
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
        <ProductChrome
          variant="dark"
          favorite={favorite}
          onBack={onBack}
          onToggleFav={onToggleFav}
        />

        {/* nome + garrafa */}
        <Box alignItems="center" marginTop="s8">
          <Text variant="eyebrow" style={{ letterSpacing: 3.6 }}>
            Safra {wine.vintage}
          </Text>
          <Text
            color="textOnDark"
            textAlign="center"
            marginTop="s8"
            style={{ fontFamily: fonts.serifSemiBold, fontSize: 60, lineHeight: 58 }}>
            {wine.name}
          </Text>
          <Box marginTop="s16">
            <BottleGraphic
              width={96}
              color={wine.color}
              initials={wine.initials}
              vintage={wine.vintage}
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
            {fullCategory(wine).toUpperCase()}
          </Text>
        </Box>

        <TouchableOpacityBox
          activeOpacity={0.7}
          onPress={onReviews}
          flexDirection="row"
          alignItems="center"
          marginTop="s16"
          style={{ gap: 8 }}>
          <StarRating value={wine.averageRating} size={14} />
          <Text variant="body" fontSize={12} color="accent">
            {nf(wine.averageRating)} · {wine.reviewCount} avaliações
          </Text>
        </TouchableOpacityBox>

        <Text
          color="textOnDark"
          marginTop="s22"
          style={{ fontFamily: fonts.serifItalic, fontSize: 22, lineHeight: 31 }}>
          &quot;{wine.signature}&quot;
        </Text>

        {/*
          Vídeo do sommelier em formato de STORY.
          Era um player deitado de 196 de altura com um ▶ no meio, que ao tocar
          trocava por um "Reproduzindo…" no mesmo retângulo — o vídeo nunca saía
          daquela moldura. Agora o preview é uma MINIATURA da tela do story (ver
          `organisms/sommelier-story`) e o toque a faz crescer até ocupar a
          janela, com barra de progresso por trecho e o nome do rótulo no topo.
        */}
        <Box marginTop="s28">
          <Text variant="eyebrow" marginBottom="s14">
            Palavra do sommelier
          </Text>
          <SommelierStoryPreview wine={wine} onOpen={onStory} />
        </Box>

        {/* harmoniza */}
        <Box marginTop="s28">
          <Text variant="eyebrow" marginBottom="s12">
            Harmoniza com
          </Text>
          <Pairings items={wine.pairings} dark />
        </Box>

        {/* estoque baixo */}
        {wine.lowStock && (
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

/**
 * Garrafa do produto comum. 66 de largura são ~215 de altura (`/46 × 150`, a
 * proporção do `BottleGraphic`) — a altura da faixa de identidade inteira.
 *
 * Sem nicho nem brilho na base, ao contrário da ficha de `RareWineCard`: o
 * degradê dourado que ali dá luz sobre bordô, aqui sobre creme CLAREIA, e o
 * retângulo arredondado aparece como uma placa atrás da garrafa.
 */
const BOTTLE_W = 66;

/**
 * Ficha do rótulo comum.
 *
 * Antes era uma coluna centrada com a garrafa a 110px de largura no topo — ou
 * seja, 358px de altura, metade da tela ocupada por um desenho antes da
 * primeira informação. E o que vinha logo abaixo repetia: "Primitivo · Puglia"
 * seguido de "TINTO · PRIMITIVO · PUGLIA".
 *
 * Agora a identidade é uma faixa de DUAS colunas — garrafa à esquerda, safra +
 * nome + categoria + nota à direita. A garrafa cai para 66px e a altura dela
 * deixa de ser espaço morto: passa a ser a altura do bloco de identidade
 * inteiro. Preço e CTA saem do meio do scroll e viram rodapé fixo, como no
 * layout premium — no comum eles estavam soltos entre a citação e o
 * "Harmoniza com", e sumiam ao rolar.
 */
function ProductStandard({
  wine,
  favorite,
  onBack,
  onToggleFav,
  onBuy,
  onReviews,
}: LayoutProps) {
  const footer = (
    <Box
      flexDirection="row"
      alignItems="center"
      backgroundColor="background"
      borderTopWidth={1}
      borderTopColor="inkBorder10"
      paddingHorizontal="s22"
      paddingTop="s16"
      paddingBottom="s12"
      style={{ gap: 16 }}>
      <Box>
        <Text variant="label" fontSize={8} color="inkA50" style={{ letterSpacing: 1.6 }}>
          Preço
        </Text>
        <Text color="primary" style={{ fontFamily: fonts.serifRegular, fontSize: 28 }}>
          {brl(wine.price)}
        </Text>
      </Box>
      <Box flex={1}>
        <Button label="Adquirir" fullWidth onPress={onBuy} />
      </Box>
    </Box>
  );

  return (
    <Screen scroll footer={footer}>
      <StatusBar style="dark" />
      <Box paddingHorizontal="s22" paddingTop="s6" paddingBottom="s34">
        <ProductChrome
          variant="light"
          favorite={favorite}
          onBack={onBack}
          onToggleFav={onToggleFav}
        />

        {/* identidade: garrafa + rótulo lado a lado */}
        <Box
          flexDirection="row"
          alignItems="center"
          marginTop="s20"
          style={{ gap: 18 }}>
          <BottleGraphic
            width={BOTTLE_W}
            color={wine.color}
            initials={wine.initials}
            vintage={wine.vintage}
            capColor={palette.wine}
            labelMode="full"
            labelBg={palette.cremeSurface}
          />

          <Box flex={1}>
            <Text variant="eyebrow" style={{ letterSpacing: 3.4 }}>
              Safra {wine.vintage}
            </Text>
            <Text
              color="primary"
              marginTop="s8"
              style={{ fontFamily: fonts.serifSemiBold, fontSize: 34, lineHeight: 35 }}>
              {wine.name}
            </Text>
            {/*
              UMA linha de categoria, e é a completa. Antes havia duas —
              "Primitivo · Puglia" em serifada e a mesma informação logo abaixo
              em caixa alta com o tipo na frente.
            */}
            <Text
              variant="label"
              fontSize={8.5}
              color="inkA50"
              marginTop="s10"
              style={{ letterSpacing: 1.8, lineHeight: 15 }}>
              {fullCategory(wine)}
            </Text>

            <TouchableOpacityBox
              activeOpacity={0.7}
              onPress={onReviews}
              flexDirection="row"
              alignItems="center"
              marginTop="s14"
              style={{ gap: 8 }}>
              <StarRating value={wine.averageRating} size={13} />
              <Text variant="body" fontSize={11.5} color="accentDark">
                {nf(wine.averageRating)} · {wine.reviewCount}
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>

        {/*
          Citação em largura cheia com o fio bordô à esquerda — o mesmo remate
          da categoria no layout premium. Centrada e com `maxWidth`, como era
          antes, ela ficava com o mesmo peso do nome logo acima.
        */}
        <Box marginTop="s26" flexDirection="row" alignItems="stretch" style={{ gap: 14 }}>
          <Box width={2} backgroundColor="accent" />
          <Text
            color="textPrimary"
            flex={1}
            style={{ fontFamily: fonts.serifItalic, fontSize: 20, lineHeight: 28 }}>
            &quot;{wine.signature}&quot;
          </Text>
        </Box>

        {/* dados técnicos */}
        <Box flexDirection="row" marginTop="s26" style={{ gap: 8 }}>
          <SpecChip value={String(wine.vintage)} label="Safra" />
          <SpecChip value={wine.body} label="Corpo" />
          <SpecChip value={`★ ${nf(wine.averageRating)}`} label={`${wine.reviewCount} aval.`} />
        </Box>

        {wine.lowStock && (
          <Box marginTop="s18" flexDirection="row" alignItems="center" style={{ gap: 10 }}>
            <Blip size={7} color={palette.wine} />
            <Text variant="body" fontSize={11} color="inkA60">
              Restam poucas unidades desta safra
            </Text>
          </Box>
        )}

        {/* harmoniza */}
        <Box marginTop="s30" paddingTop="s26" borderTopWidth={1} borderTopColor="inkBorder10">
          <Text variant="eyebrow" color="accent" marginBottom="s14">
            Harmoniza com
          </Text>
          <Pairings items={wine.pairings} />
        </Box>
      </Box>
    </Screen>
  );
}
