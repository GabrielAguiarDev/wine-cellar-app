import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
  type SvgProps,
} from 'react-native-svg';

import { palette } from '@theme/index';

type FlagSpec = {
  /** Faixas na ordem de leitura (esquerda→direita ou topo→base). */
  bands: string[];
  /** Peso de cada faixa. Ausente = todas iguais. */
  weights?: number[];
  /** Direção das faixas. Default: 'vertical'. */
  direction?: 'vertical' | 'horizontal';
  /** Emblema central opcional (sol, estrela…), desenhado sobre as faixas. */
  emblem?: React.ReactNode;
};

/**
 * Cores nacionais. NÃO são tokens da marca (por isso ficam fora do tema): são
 * as cores oficiais de cada bandeira, e trocá-las descaracterizaria o país.
 * Só entram aqui países que o desenho em faixas representa fielmente — os
 * demais caem no `FALLBACK`.
 */
const FLAGS: Record<string, FlagSpec> = {
  Itália: { bands: ['#008C45', '#F4F5F0', '#CD212A'] },
  França: { bands: ['#0055A4', '#FFFFFF', '#EF4135'] },
  Portugal: { bands: ['#046A38', '#DA291C'], weights: [2, 3] },
  Argentina: {
    bands: ['#74ACDF', '#FFFFFF', '#74ACDF'],
    direction: 'horizontal',
    // O sol sobe um pouco em relação ao centro real: na base do card ele ficaria
    // atrás do nome, sob o véu.
    emblem: (
      <Circle
        cx={1.5}
        cy={0.82}
        r={0.19}
        fill="#F6B40E"
        stroke="#C68A17"
        strokeWidth={0.035}
      />
    ),
  },
  Espanha: {
    bands: ['#AA151B', '#F1BF00', '#AA151B'],
    weights: [1, 2, 1],
    direction: 'horizontal',
  },
};

/** País sem bandeira mapeada: campo bordô liso, para o card seguir legível. */
const FALLBACK: FlagSpec = { bands: [palette.wine] };

type FlagProps = {
  /** Nome do país como vem do catálogo (`wineCountry`). */
  country: string;
  width: number;
  height: number;
} & Pick<SvgProps, 'style'>;

/**
 * Bandeira desenhada em SVG — sem imagem/asset, então escala sem peso e sem
 * rede. O `viewBox` é 3×2 e as faixas esticam para preencher o card
 * (`preserveAspectRatio="none"`): o desenho acompanha a proporção do card em
 * vez de deixar tarja vazia.
 */
export function Flag({ country, width, height, style }: FlagProps) {
  const {
    bands,
    weights,
    direction = 'vertical',
    emblem,
  } = FLAGS[country] ?? FALLBACK;

  const horizontal = direction === 'horizontal';
  /** Comprimento total no eixo das faixas (viewBox 3×2). */
  const axis = horizontal ? 2 : 3;
  const parts = weights ?? bands.map(() => 1);
  const unit = axis / parts.reduce((acc, w) => acc + w, 0);

  const rects = bands.map((color, i) => {
    const size = parts[i] * unit;
    /** Início da faixa = soma das anteriores. */
    const start = parts.slice(0, i).reduce((acc, w) => acc + w, 0) * unit;
    return (
      <Rect
        key={i}
        x={horizontal ? 0 : start}
        y={horizontal ? start : 0}
        width={horizontal ? 3 : size}
        height={horizontal ? size : 2}
        fill={color}
      />
    );
  });

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 3 2"
      preserveAspectRatio="none"
      style={style}>
      <Defs>
        {/* Brilho diagonal leve: dá volume de tecido a um preenchimento chapado. */}
        <LinearGradient id="flagSheen" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.white} stopOpacity={0.2} />
          <Stop offset="0.45" stopColor={palette.white} stopOpacity={0.03} />
          <Stop offset="1" stopColor={palette.black} stopOpacity={0.1} />
        </LinearGradient>
      </Defs>

      {rects}
      {emblem}

      <Rect x={0} y={0} width={3} height={2} fill="url(#flagSheen)" />
    </Svg>
  );
}
