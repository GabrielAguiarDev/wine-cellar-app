import { StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { fonts, palette } from '@theme/index';

import { Blip } from './Blip';
import { BottleGraphic } from './BottleGraphic';
import { Box } from './Box';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type RareWineCardData = {
  name: string;
  /** Ex.: "Tinto · Nebbiolo · Piemonte". */
  category: string;
  /** Assinatura do sommelier (frase de degustação). */
  signature: string;
  vintage: number;
  priceFmt: string;
  ratingFmt: string;
  reviewCount: number;
  color: string;
  initials: string;
  /** Duração do vídeo do sommelier, quando há. */
  videoDuration?: string;
  lowStock?: boolean;
};

type RareWineCardProps = {
  data: RareWineCardData;
  /** Posição na coleção (1-based) — vira a numeração editorial no canto. */
  position: number;
  onPress?: () => void;
};

/**
 * Coluna da garrafa. A altura é a da garrafa (`BOTTLE_WIDTH / 46 × 150`, a
 * proporção do `BottleGraphic`) mais a folga de topo — mais alto que isso e
 * sobra um vazio à direita da garrafa nos rótulos de assinatura curta.
 */
const NICHE_WIDTH = 80;
const NICHE_HEIGHT = 186;
const BOTTLE_WIDTH = 48;

/**
 * Dado técnico em caixa própria — o padrão "valor grande + rótulo miúdo" das
 * fichas de produto (safra, nota). Vive aqui e não no DS geral porque só esta
 * ficha usa a variante escura sobre bordô.
 */
function SpecChip({ value, label }: { value: string; label: string }) {
  return (
    <Box
      backgroundColor="cremeA06"
      borderWidth={1}
      borderColor="goldA28"
      borderRadius="r11"
      paddingVertical="s8"
      paddingHorizontal="s12"
      minWidth={76}>
      <Text
        style={{
          fontFamily: fonts.serifSemiBold,
          fontSize: 17,
          lineHeight: 19,
          color: palette.creme,
        }}>
        {value}
      </Text>
      <Text
        variant="label"
        fontSize={7.5}
        color="cremeA50"
        marginTop="s2"
        style={{ letterSpacing: 1.2 }}>
        {label}
      </Text>
    </Box>
  );
}

/**
 * Ficha editorial de um rótulo raro — a peça da coleção reservada
 * (`app/reserved.tsx`).
 *
 * Não é um `WineRow` maior: a linha existe para VARRER uma lista, e aqui há três
 * garrafas que precisam ser lidas uma a uma. Por isso o nome ocupa a largura
 * inteira, a assinatura do sommelier aparece por extenso e os dados técnicos
 * viram caixas (`SpecChip`).
 *
 * ── A luz sob a garrafa ─────────────────────────────────────────────────────
 *
 * A garrafa fica direto sobre o fundo do card, com um brilho dourado MUITO tênue
 * subindo da base — a citação da foto da adega do hero, onde as prateleiras são
 * iluminadas por baixo. Antes era uma reentrância fechada (fundo `wineDark2`,
 * borda e fita dourada no rodapé): lia como um retângulo recortado no card, e o
 * bloco escuro competia com a própria garrafa. Ficou só a luz.
 *
 * A luz é um gradiente (não sombra/blur): sombra colorida no Android é irregular
 * e cairia em três instâncias na mesma tela.
 */
export function RareWineCard({ data, position, onPress }: RareWineCardProps) {
  return (
    <PressableScale
      accessibilityLabel={`${data.name}, ${data.category}, ${data.priceFmt}`}
      /* Ficha de largura cheia — mesma escala contida do `WineRow`. */
      scaleTo={0.98}
      onPress={onPress}
      borderRadius="r18"
      borderWidth={1}
      borderColor="goldA28"
      overflow="hidden"
      padding="s18">
      <LinearGradient
        colors={[palette.wineDeeper, palette.wineDark2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* etiqueta + numeração editorial */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between">
        <Text variant="eyebrow" fontSize={8.5} style={{ letterSpacing: 2.6 }}>
          ◆ Edição limitada
        </Text>
        {/*
          Numeração em SANS, não na serifada da marca: o Cormorant usa algarismos
          de estilo antigo (`01` sai com o zero na altura de x e o um parecendo um
          i minúsculo), o que num número de duas casas viraria uma palavra. Nos
          anos de safra o efeito é bem-vindo — em índice, não.
        */}
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 11,
            color: palette.goldDark,
            letterSpacing: 1.6,
          }}>
          {String(position).padStart(2, '0')}
        </Text>
      </Box>

      {/* nome em largura cheia — é o que dá peso à ficha */}
      <Text
        color="textOnDark"
        marginTop="s12"
        style={{
          fontFamily: fonts.serifSemiBold,
          fontSize: 27,
          lineHeight: 29,
        }}>
        {data.name}
      </Text>
      <Text
        variant="label"
        fontSize={8.5}
        color="cremeA50"
        marginTop="s6"
        style={{ letterSpacing: 1.5 }}>
        {data.category}
      </Text>

      {/*
        `alignItems="center"`: a coluna de texto é mais curta que o nicho nos
        rótulos de assinatura curta e sem "últimas garrafas" (Corona Reale), e
        alinhada ao topo deixava um vazio grande à direita da base da garrafa.
        Centrada, a assinatura cai na altura do ombro da garrafa e a sobra se
        divide nas duas pontas.
      */}
      <Box
        flexDirection="row"
        alignItems="center"
        marginTop="s16"
        style={{ gap: 18 }}>
        {/* base retroiluminada */}
        <Box
          width={NICHE_WIDTH}
          height={NICHE_HEIGHT}
          borderRadius="r12"
          overflow="hidden"
          alignItems="center"
          justifyContent="flex-end">
          <LinearGradient
            colors={[
              'transparent',
              'rgba(176,141,87,0.04)',
              'rgba(176,141,87,0.13)',
            ]}
            locations={[0, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Box marginBottom="s8">
            <BottleGraphic
              width={BOTTLE_WIDTH}
              color={data.color}
              initials={data.initials}
              vintage={data.vintage}
              labelMode="full"
              premium
            />
          </Box>
        </Box>

        <Box flex={1}>
          <Text
            color="cremeA70"
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 15,
              lineHeight: 21,
            }}>
            {data.signature}
          </Text>

          <Box flexDirection="row" marginTop="s16" style={{ gap: 8 }}>
            <SpecChip value={String(data.vintage)} label="Safra" />
            <SpecChip
              value={`★ ${data.ratingFmt}`}
              label={`${data.reviewCount} aval.`}
            />
          </Box>

          {data.lowStock && (
            <Box
              marginTop="s10"
              alignSelf="flex-start"
              flexDirection="row"
              alignItems="center"
              backgroundColor="cremeA06"
              borderRadius="rFull"
              paddingVertical="s4"
              paddingHorizontal="s10"
              style={{ gap: 6 }}>
              <Blip size={5} />
              <Text
                variant="label"
                fontSize={8}
                color="cremeA70"
                style={{ letterSpacing: 1.4 }}>
                Últimas garrafas
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      <Box height={1} backgroundColor="cremeA08" marginTop="s18" />

      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginTop="s14">
        {data.videoDuration ? (
          <Box flexDirection="row" alignItems="center" style={{ gap: 9 }}>
            <Box
              width={23}
              height={23}
              borderRadius="rFull"
              borderWidth={1}
              borderColor="goldA55"
              alignItems="center"
              justifyContent="center">
              <Icon name="play" size={8} color={palette.gold} />
            </Box>
            <Text
              variant="label"
              fontSize={8.5}
              color="cremeA60"
              style={{ letterSpacing: 1.4 }}>
              Sommelier · {data.videoDuration}
            </Text>
          </Box>
        ) : (
          <Box />
        )}
        <Box flexDirection="row" alignItems="center" style={{ gap: 10 }}>
          <Text variant="price" fontSize={21} color="accent">
            {data.priceFmt}
          </Text>
          <Icon name="arrowRight" size={11} color={palette.gold} />
        </Box>
      </Box>
    </PressableScale>
  );
}
