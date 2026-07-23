import { DevStub } from '@components/index';

/** Stub dos Favoritos (Fase 10). */
export default function FavoritesScreen() {
  return (
    <DevStub
      title="Favoritos"
      subtitle="Sua garrafeira salva entra na Fase 10."
      links={[{ label: 'Abrir um produto (ex.)', href: '/product/lumiere-blanche' }]}
    />
  );
}
