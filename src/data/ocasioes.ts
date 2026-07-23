import { type Ocasiao } from './types';

/** Ocasiões do sommelier virtual — idênticas ao protótipo (`this.ocasioes`). */
export const OCASIOES: Ocasiao[] = [
  {
    key: 'romantico',
    label: 'Jantar romântico',
    desc: 'Rótulos que aquecem a conversa',
    ids: ['notte-eterna', 'rosa-dei-venti', 'lumiere-blanche'],
  },
  {
    key: 'presente',
    label: 'Presente',
    desc: 'Impressione com elegância',
    ids: ['corona-reale', 'perla-nera', 'lumiere-blanche'],
  },
  {
    key: 'churrasco',
    label: 'Churrasco',
    desc: 'Tintos para as brasas',
    ids: ['velluto-rosso', 'aurora-del-sud', 'sangue-di-terra'],
  },
  {
    key: 'comemoracao',
    label: 'Comemoração',
    desc: 'Borbulhas para brindar',
    ids: ['perla-nera', 'alba-serena', 'corona-reale'],
  },
];
