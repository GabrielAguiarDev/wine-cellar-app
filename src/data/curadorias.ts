import { palette } from '@theme/index';

/**
 * Curadorias/coleções editoriais. Uma curadoria é a fonte ÚNICA do conteúdo
 * exibido pelo `BlocoCuradoria` nos seus dois estados (card na Home e tela
 * cheia na tela de destino) — o mesmo registro alimenta os dois, para que a
 * shared element transition não tenha texto/cor divergindo entre origem e
 * destino.
 */
export type Curadoria = {
  /** Slug da rota `/curadoria/[id]` e gancho do shared element. */
  id: string;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  botaoLabel: string;
  /** Fundo (gradiente bordô). 1 cor = sólido. */
  cores: string[];
  /** Vinhos da coleção (ids de `WINES`). */
  wineIds: string[];
};

export const CURADORIAS: Curadoria[] = [
  {
    id: 'curadoria-semana',
    eyebrow: 'Curadoria da semana',
    titulo: 'Noites de inverno, taças cheias',
    subtitulo: 'Tintos encorpados para harmonizar com sabores e memórias.',
    botaoLabel: 'Explorar coleção',
    cores: [palette.wineLight, palette.wine, palette.wineDeeper],
    wineIds: [
      'notte-eterna',
      'sangue-di-terra',
      'velluto-rosso',
      'corona-reale',
      'aurora-del-sud',
    ],
  },
];

export function findCuradoria(id: string): Curadoria | undefined {
  return CURADORIAS.find(c => c.id === id);
}

/** Curadoria em destaque na Home. */
export const CURADORIA_SEMANA = CURADORIAS[0];
