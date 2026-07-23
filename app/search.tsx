import { DevStub } from '@components/index';

/** Stub da Busca/Coleção (Fase 6). */
export default function SearchScreen() {
  return (
    <DevStub
      title="Coleção"
      subtitle="Busca por vinho/prato e filtros entram na Fase 6."
      links={[
        { label: 'Sommelier virtual', href: '/sommelier' },
        { label: 'Abrir um produto (ex.)', href: '/product/corona-reale' },
      ]}
    />
  );
}
