import { StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { alpha, fonts, palette } from '@theme/index';

import { Box } from './Box';
import { Text } from './Text';

type BottleGraphicProps = {
  /** Largura do corpo da garrafa em px (define a escala; base de design = 46). */
  width?: number;
  /** Cor do vidro da garrafa. */
  cor: string;
  /** Iniciais no rótulo (ex.: 'NE'). */
  iniciais: string;
  /** Safra — exibida no rótulo quando labelMode='full'. */
  safra?: number;
  /** Cor da cápsula (default: dourada se premium, senão escura). */
  capColor?: string;
  /** Exibe a cápsula sobre o gargalo. */
  showCap?: boolean;
  /** Variante premium: cápsula dourada + brilho cilíndrico no corpo. */
  premium?: boolean;
  /** Rótulo: só iniciais (default) ou completo (IL DiVino + iniciais + safra). */
  labelMode?: 'initials' | 'full';
  /** Cor de fundo do rótulo. */
  labelBg?: string;
};

const BASE_W = 46;

export function BottleGraphic({
  width = 46,
  cor,
  iniciais,
  safra,
  capColor,
  showCap = true,
  premium = false,
  labelMode = 'initials',
  labelBg = palette.creme,
}: BottleGraphicProps) {
  const s = width / BASE_W;
  const px = (n: number) => n * s;

  const frameW = px(46);
  const frameH = px(150);
  const cap = capColor ?? (premium ? palette.gold : '#2A1C12');
  const full = labelMode === 'full';

  return (
    <Box width={frameW} height={frameH} position="relative">
      {/* gargalo */}
      <Box
        position="absolute"
        top={0}
        left={frameW / 2 - px(15) / 2}
        width={px(15)}
        height={px(34)}
        style={{
          backgroundColor: cor,
          borderTopLeftRadius: px(5),
          borderTopRightRadius: px(5),
        }}
      />
      {/* cápsula */}
      {showCap && (
        <Box
          position="absolute"
          top={px(8)}
          left={frameW / 2 - px(15) / 2}
          width={px(15)}
          height={px(9)}
          style={{ backgroundColor: cap }}
        />
      )}
      {/* corpo */}
      <Box
        position="absolute"
        top={px(30)}
        left={0}
        width={px(46)}
        height={px(120)}
        style={{
          backgroundColor: cor,
          borderTopLeftRadius: px(22),
          borderTopRightRadius: px(22),
          borderBottomLeftRadius: px(12),
          borderBottomRightRadius: px(12),
          overflow: 'hidden',
        }}>
        {premium && (
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.12)',
              'rgba(255,255,255,0)',
              'rgba(0,0,0,0.4)',
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </Box>
      {/* rótulo */}
      <Box
        position="absolute"
        top={px(66)}
        left={frameW / 2 - px(full ? 40 : 38) / 2}
        width={px(full ? 40 : 38)}
        height={px(full ? 48 : 44)}
        alignItems="center"
        justifyContent="center"
        style={{ backgroundColor: labelBg, borderRadius: 3 }}>
        {full && (
          <Text
            style={{
              fontFamily: fonts.sansRegular,
              fontSize: px(7),
              letterSpacing: px(1.8),
              color: palette.gold,
              textTransform: 'uppercase',
            }}>
            IL DiVino
          </Text>
        )}
        <Text
          style={{
            fontFamily: fonts.serifSemiBold,
            fontSize: px(16),
            color: palette.wine,
            lineHeight: px(18),
          }}>
          {iniciais}
        </Text>
        {full && safra != null && (
          <Text
            style={{
              fontFamily: fonts.sansRegular,
              fontSize: px(7),
              letterSpacing: px(1.4),
              color: alpha.wineA60,
            }}>
            {safra}
          </Text>
        )}
      </Box>
    </Box>
  );
}
