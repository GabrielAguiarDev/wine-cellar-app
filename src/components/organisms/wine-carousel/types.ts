import { type SharedValue } from 'react-native-reanimated';

import { type Wine } from '@data/types';

/**
 * Progresso do scroll em "unidades de item": 0 = primeiro item centralizado,
 * 1.5 = a meio caminho entre o segundo e o terceiro. É normalizado dentro do
 * handler de scroll (offset ÷ intervalo), então quem consome não precisa saber
 * largura nem espaçamento — só comparar com o próprio índice.
 */
export type ProgressoCarrossel = SharedValue<number>;

export type CarrosselVinhosProps = {
  vinhos: Wine[];
  /** Criado por quem compõe a tela e compartilhado com o `FundoVinhos`. */
  progresso: ProgressoCarrossel;
  onSelecionar: (id: string) => void;
};

export type FundoVinhosProps = {
  vinhos: Wine[];
  /** O MESMO shared value passado ao carrossel. */
  progresso: ProgressoCarrossel;
};

export type SlideVinhoProps = {
  vinho: Wine;
  indice: number;
  progresso: ProgressoCarrossel;
  largura: number;
  altura: number;
  onPress: () => void;
};
