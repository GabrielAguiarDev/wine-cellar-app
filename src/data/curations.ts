import { palette } from '@theme/index';

/**
 * Curadorias/coleções editoriais. Uma curadoria é a fonte ÚNICA do conteúdo
 * exibido pelo `CurationBlock` nos seus dois estados (card na Home e tela
 * cheia na tela de destino) — o mesmo registro alimenta os dois, para que a
 * shared element transition não tenha texto/cor divergindo entre origem e
 * destino.
 */
export type Curation = {
  /** Slug da rota `/curation/[id]` e gancho do shared element. */
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  /** Fundo (gradiente bordô). 1 cor = sólido. */
  colors: string[];
  /** Vinhos da coleção (ids de `WINES`). */
  wineIds: string[];
};

export const CURATIONS: Curation[] = [
  {
    id: 'weekly-curation',
    eyebrow: 'Curadoria da semana',
    title: 'Noites de inverno, taças cheias',
    subtitle: 'Tintos encorpados para harmonizar com sabores e memórias.',
    buttonLabel: 'Explorar coleção',
    colors: [palette.wineLight, palette.wine, palette.wineDeeper],
    wineIds: [
      'notte-eterna',
      'sangue-di-terra',
      'velluto-rosso',
      'corona-reale',
      'aurora-del-sud',
    ],
  },
];

export function findCuration(id: string): Curation | undefined {
  return CURATIONS.find(c => c.id === id);
}

/** Curadoria em destaque na Home. */
export const WEEKLY_CURATION = CURATIONS[0];
