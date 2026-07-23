import { useRouter } from 'expo-router';

import { DevStub } from '@components/index';

/** Stub do Sommelier virtual (Fase 9). */
export default function SommelierScreen() {
  const router = useRouter();
  return (
    <DevStub
      title="Sommelier virtual"
      subtitle="Recomendação por ocasião entra na Fase 9."
      dark
      onBack={() => router.back()}
      links={[{ label: 'Abrir um produto (ex.)', href: '/product/perla-nera' }]}
    />
  );
}
