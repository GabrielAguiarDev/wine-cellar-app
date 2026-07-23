import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';

import { palette } from '@theme/index';

export type IconName =
  | 'search'
  | 'heart'
  | 'bag'
  | 'home'
  | 'profile'
  | 'chevronLeft'
  | 'chevronRight'
  | 'arrowRight'
  | 'play'
  | 'star'
  | 'phone'
  | 'check'
  | 'plus';

type IconProps = {
  name: IconName;
  size?: number;
  /** Cor do traço (stroke). */
  color?: string;
  /** Preenchimento (para heart/star). Default: 'none'. */
  fill?: string;
  /** Sobrescreve a espessura do traço padrão do ícone. */
  strokeWidth?: number;
} & Pick<SvgProps, 'style'>;

type IconSpec = {
  viewBox: string;
  strokeWidth: number;
  /** true → o ícone é preenchível (heart/star); usa `fill`. */
  fillable?: boolean;
  render: (p: { color: string; fill: string; strokeWidth: number }) => React.ReactNode;
};

const ICONS: Record<IconName, IconSpec> = {
  search: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    render: ({ color, strokeWidth }) => (
      <>
        <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={strokeWidth} />
        <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      </>
    ),
  },
  heart: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.4,
    fillable: true,
    render: ({ color, fill, strokeWidth }) => (
      <Path
        d="M12 20s-7-4.5-9.2-9C1.3 8 2.8 4.5 6.2 4.5c2 0 3.2 1.2 3.8 2.3C10.6 5.7 11.8 4.5 13.8 4.5c3.4 0 4.9 3.5 3.4 6.5C19 15.5 12 20 12 20z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    ),
  },
  bag: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 016 0v2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
  home: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M3 11l9-7 9 7M5 10v9h5v-6h4v6h5v-9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
  profile: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    render: ({ color, strokeWidth }) => (
      <>
        <Circle cx={12} cy={8} r={3.6} stroke={color} strokeWidth={strokeWidth} />
        <Path
          d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  chevronLeft: {
    viewBox: '0 0 8 14',
    strokeWidth: 1.6,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M7 1L1 7l6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  chevronRight: {
    viewBox: '0 0 8 14',
    strokeWidth: 1.5,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M1 1l6 6-6 6"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  arrowRight: {
    viewBox: '0 0 12 12',
    strokeWidth: 1.4,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M2 6h8M6 2l4 4-4 4"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  play: {
    viewBox: '0 0 16 18',
    strokeWidth: 0,
    render: ({ color }) => <Path d="M2 1l13 8-13 8z" fill={color} />,
  },
  star: {
    viewBox: '0 0 20 20',
    strokeWidth: 1,
    fillable: true,
    render: ({ color, fill, strokeWidth }) => (
      <Path
        d="M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.3 5.2 16.9l.9-5.4L2.2 7.7l5.4-.8z"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    ),
  },
  phone: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.4,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M4 5c0 8 7 15 15 15l-3-4-3 1c-2-1-4-3-5-5l1-3-2-4z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  check: {
    viewBox: '0 0 11 9',
    strokeWidth: 1.6,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M1 4.5l3 3 6-6"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  plus: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.6,
    render: ({ color, strokeWidth }) => (
      <Path
        d="M10 4v12M4 10h12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    ),
  },
};

/** Ícone SVG central do design system. */
export function Icon({
  name,
  size = 22,
  color = palette.wine,
  fill = 'none',
  strokeWidth,
  style,
}: IconProps) {
  const spec = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox={spec.viewBox} style={style}>
      {spec.render({
        color,
        fill: spec.fillable ? fill : 'none',
        strokeWidth: strokeWidth ?? spec.strokeWidth,
      })}
    </Svg>
  );
}
