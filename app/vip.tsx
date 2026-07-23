import { useRouter } from 'expo-router';

import { DevStub } from '@components/index';

/** Stub do Acesso antecipado / VIP (Fase 14). */
export default function VipScreen() {
  const router = useRouter();
  return (
    <DevStub
      title="Lançamentos antecipados"
      subtitle="Exclusivo nível VIP — pré-lançamentos entram na Fase 14."
      dark
      onBack={() => router.back()}
      links={[{ label: 'Abrir um produto (ex.)', href: { pathname: '/product/[id]', params: { id: 'perla-nera' } } }]}
    />
  );
}
