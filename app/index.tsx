import { useState } from 'react';

import {
  BottleGraphic,
  Box,
  Button,
  Chip,
  Icon,
  Pill,
  Screen,
  ScreenHeader,
  SectionTitle,
  SegmentedToggle,
  StarRating,
  Text,
  Toast,
  Toggle,
  WineCard,
  WineRow,
} from '@components/index';
import { palette } from '@theme/index';

/**
 * TEMPORÁRIO (Fase 1): catálogo visual do design system.
 * Será substituído pelo roteamento real na Fase 3/4.
 */
export default function CatalogScreen() {
  const [rating, setRating] = useState(3);
  const [seg, setSeg] = useState<'vinho' | 'prato'>('vinho');
  const [gift, setGift] = useState(false);

  return (
    <Screen scroll>
      <Box padding="s22" style={{ gap: 30 }}>
        <Box>
          <Text variant="eyebrow">Design System</Text>
          <Text variant="h2" marginTop="s4">
            IL DiVino · Fase 1
          </Text>
        </Box>

        {/* Tipografia */}
        <Box style={{ gap: 6 }}>
          <SectionTitle>Tipografia</SectionTitle>
          <Text variant="h1">Cormorant Garamond</Text>
          <Text variant="wineName">Nome do vinho (serif)</Text>
          <Text variant="quote">&quot;Uma citação em itálico.&quot;</Text>
          <Text variant="body">Corpo de texto em Jost (sans).</Text>
          <Text variant="label">Label · caixa alta</Text>
        </Box>

        {/* Botões */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>Botões</SectionTitle>
          <Button label="Adquirir" variant="primary" fullWidth />
          <Button label="Explorar coleção" variant="outline" fullWidth />
          <Box backgroundColor="primary" borderRadius="r12" padding="s20">
            <Button label="Entrar" variant="outlineGold" fullWidth />
          </Box>
        </Box>

        {/* Pills + Chips */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>Pills &amp; Chips</SectionTitle>
          <Box flexDirection="row" style={{ gap: 9 }}>
            <Pill label="Todos" active />
            <Pill label="Tinto" />
            <Pill label="Espumante" />
          </Box>
          <Box flexDirection="row" style={{ gap: 8 }}>
            <Chip label="Uva" />
            <Chip label="País" />
            <Chip label="Preço" />
          </Box>
        </Box>

        {/* Estrelas */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>Avaliação</SectionTitle>
          <Box flexDirection="row" alignItems="center" style={{ gap: 10 }}>
            <StarRating value={4.7} size={16} />
            <Text variant="bodySm" color="accentDark">
              4,7 · 128 avaliações
            </Text>
          </Box>
          <StarRating value={rating} size={30} editable onChange={setRating} />
        </Box>

        {/* Garrafas */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>Garrafas</SectionTitle>
          <Box flexDirection="row" alignItems="flex-end" style={{ gap: 20 }}>
            <BottleGraphic width={34} cor="#4a121c" iniciais="NE" showCap={false} />
            <BottleGraphic width={46} cor="#9aa06a" iniciais="LB" />
            <BottleGraphic
              width={80}
              cor="#3a0d15"
              iniciais="CR"
              safra={2016}
              labelMode="full"
              premium
            />
          </Box>
        </Box>

        {/* WineCard */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>WineCard</SectionTitle>
          <Box flexDirection="row" style={{ gap: 16 }}>
            <WineCard
              data={{
                nome: 'Notte Eterna',
                categoria: 'TINTO · NEBBIOLO',
                precoFmt: 'R$ 489',
                notaFmt: '4,7',
                cor: '#4a121c',
                iniciais: 'NE',
                destaque: true,
                favorito: true,
              }}
            />
            <WineCard
              data={{
                nome: 'Lumière Blanche',
                categoria: 'BRANCO · CHARDONNAY',
                precoFmt: 'R$ 279',
                notaFmt: '4,6',
                cor: '#9aa06a',
                iniciais: 'LB',
              }}
            />
          </Box>
        </Box>

        {/* WineRow claro */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>WineRow</SectionTitle>
          <WineRow
            data={{
              nome: 'Corona Reale',
              categoria: 'TINTO · CABERNET · BORDEAUX',
              precoFmt: 'R$ 890',
              cor: '#3a0d15',
              iniciais: 'CR',
            }}
            subtitle="★ 4,8 · 210 avaliações"
          />
          {/* WineRow escuro */}
          <Box backgroundColor="primary" borderRadius="r16" padding="s16">
            <WineRow
              variant="dark"
              badge="Pré-lançamento"
              data={{
                nome: 'Perla Nera',
                categoria: 'ESPUMANTE · CHARDONNAY',
                precoFmt: 'R$ 620',
                cor: '#2f4a34',
                iniciais: 'PN',
              }}
            />
          </Box>
        </Box>

        {/* Toggles */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>Toggles</SectionTitle>
          <SegmentedToggle
            value={seg}
            onChange={setSeg}
            options={[
              { key: 'vinho', label: 'Buscar vinho' },
              { key: 'prato', label: 'Buscar por prato' },
            ]}
          />
          <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
            <Toggle value={gift} onChange={setGift} />
            <Text variant="body">É um presente?</Text>
          </Box>
        </Box>

        {/* Header + ícones */}
        <Box style={{ gap: 12 }}>
          <SectionTitle>Header &amp; Ícones</SectionTitle>
          <ScreenHeader label="Sacola" onBack={() => {}} />
          <Box flexDirection="row" style={{ gap: 16 }}>
            <Icon name="home" color={palette.wine} />
            <Icon name="search" color={palette.wine} />
            <Icon name="heart" color={palette.wine} />
            <Icon name="bag" color={palette.wine} />
            <Icon name="profile" color={palette.wine} />
            <Icon name="phone" color={palette.wine} />
          </Box>
        </Box>

        <Box height={40} />
      </Box>

      <Toast message="Adicionado à sacola." bottom={30} />
    </Screen>
  );
}
