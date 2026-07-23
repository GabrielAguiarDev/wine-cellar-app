import { DevStub } from '@components/index';

/** Stub da Home (Fase 5). */
export default function HomeScreen() {
  return (
    <DevStub
      title="Início"
      subtitle="Vitrine principal — rails, curadoria e busca entram na Fase 5."
      links={[
        { label: 'Buscar / Coleção', href: '/search' },
        { label: 'Sommelier virtual', href: '/sommelier' },
        { label: 'Favoritos', href: '/favorites' },
        { label: 'Sacola', href: '/bag' },
        { label: 'Perfil', href: '/profile' },
        { label: 'Produto premium (ex.)', href: { pathname: '/product/[id]', params: { id: 'notte-eterna' } } },
        { label: 'Produto padrão (ex.)', href: { pathname: '/product/[id]', params: { id: 'aurora-del-sud' } } },
        { label: 'Catálogo do Design System', href: '/catalog' },
      ]}
    />
  );
}
