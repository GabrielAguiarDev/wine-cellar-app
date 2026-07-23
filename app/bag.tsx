import { DevStub } from '@components/index';

/** Stub da Sacola (Fase 11). */
export default function BagScreen() {
  return (
    <DevStub
      title="Sua sacola"
      subtitle="Itens, quantidades e resumo entram na Fase 11."
      links={[{ label: 'Ir para o Checkout', href: '/checkout' }]}
    />
  );
}
