/**
 * Paleta bruta (hex nomeados) derivada do protótipo de design
 * `design/project/IL DiVino.dc.html`. NÃO usar estes nomes direto na UI —
 * usar sempre os nomes semânticos do tema (theme.ts).
 */
export const palette = {
  // Cremes / fundos claros
  creme: '#F3ECDD', // fundo padrão das telas claras
  cremeSurface: '#FBF7EE', // cards, inputs, linhas de lista
  cremeOuter: '#E7E0D2', // fundo externo
  cremeToggle: '#EADFCE', // trilho dos toggles segmentados
  cremeMap: '#E4DDCD', // fundo do mapa

  // Bordôs (vinho)
  wine: '#431018', // bordô principal (texto/botões/ícones no claro)
  wineLight: '#5A1622', // topo dos gradientes radiais
  wineAlt: '#3A0E18', // gradiente do quiz
  wineDeep: '#2C0A10', // fundo dark profundo
  wineDeeper: '#320B12', // variação ainda mais escura
  wineDark2: '#1C0509', // fundo do vídeo do sommelier

  // Dourados
  gold: '#B08D57', // acento, bordas, labels, estrelas
  goldDark: '#8A6C40', // dourado escuro / links

  // Neutros
  ink: '#2A211C', // texto principal sobre creme
  mutedIcon: '#8A7D70', // cinza-marrom (ícone de busca)

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Cores com transparência recorrentes no design (rgba).
 * Mantidas separadas porque o restyle usa strings de cor diretamente.
 */
export const alpha = {
  // Texto secundário sobre creme (ink com opacidade)
  inkA50: 'rgba(42,33,28,0.5)',
  inkA55: 'rgba(42,33,28,0.55)',
  inkA60: 'rgba(42,33,28,0.6)',
  inkA65: 'rgba(42,33,28,0.65)',
  inkA35: 'rgba(42,33,28,0.35)',
  // Bordas sutis sobre creme
  inkBorder09: 'rgba(42,33,28,0.09)',
  inkBorder10: 'rgba(42,33,28,0.1)',
  inkBorder14: 'rgba(42,33,28,0.14)',
  inkBorder16: 'rgba(42,33,28,0.16)',
  inkBorder20: 'rgba(42,33,28,0.2)',
  // Texto/creme sobre fundos escuros
  cremeA82: 'rgba(243,236,221,0.82)',
  cremeA70: 'rgba(243,236,221,0.7)',
  cremeA66: 'rgba(243,236,221,0.66)',
  cremeA62: 'rgba(243,236,221,0.62)',
  cremeA60: 'rgba(243,236,221,0.6)',
  cremeA55: 'rgba(243,236,221,0.55)',
  cremeA50: 'rgba(243,236,221,0.5)',
  cremeA25: 'rgba(243,236,221,0.25)',
  cremeA15: 'rgba(243,236,221,0.15)',
  cremeA08: 'rgba(243,236,221,0.08)',
  cremeA06: 'rgba(243,236,221,0.06)',
  cremeA05: 'rgba(243,236,221,0.05)',
  // Bordas douradas
  goldA60: 'rgba(176,141,87,0.6)',
  goldA55: 'rgba(176,141,87,0.55)',
  goldA50: 'rgba(176,141,87,0.5)',
  goldA40: 'rgba(176,141,87,0.4)',
  goldA35: 'rgba(176,141,87,0.35)',
  goldA30: 'rgba(176,141,87,0.3)',
  goldA28: 'rgba(176,141,87,0.28)',
  // Bordô translúcido (rótulos / sombras)
  wineA50: 'rgba(67,16,24,0.5)',
  wineA60: 'rgba(67,16,24,0.6)',
  wineA70: 'rgba(67,16,24,0.7)',
} as const;
