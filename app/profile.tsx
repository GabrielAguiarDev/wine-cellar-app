import { DevStub } from '@components/index';

/** Stub do Perfil (Fase 14). */
export default function ProfileScreen() {
  return (
    <DevStub
      title="Perfil"
      subtitle="Card VIP, paladar, pedidos e acessos entram na Fase 14."
      links={[
        { label: 'Programa de fidelidade', href: '/loyalty' },
        { label: 'Acesso antecipado (VIP)', href: '/vip' },
        { label: 'Acompanhar pedido (ex.)', href: '/tracking' },
        { label: 'Refazer quiz de paladar', href: '/quiz' },
      ]}
    />
  );
}
