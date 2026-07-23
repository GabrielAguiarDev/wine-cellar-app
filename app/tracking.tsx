import { DevStub } from '@components/index';

/** Stub do Acompanhamento de pedido (Fase 13). */
export default function TrackingScreen() {
  return (
    <DevStub
      title="Seu pedido a caminho"
      subtitle="Pedido #ILD-4821 · timeline de status e mapa entram na Fase 13."
      links={[{ label: 'Voltar ao Início', href: '/home' }]}
    />
  );
}
