import { useRouter } from 'expo-router';

import { DevStub } from '@components/index';

/** Stub do Programa de fidelidade (Fase 14). */
export default function LoyaltyScreen() {
  const router = useRouter();
  return (
    <DevStub
      title="Programa de fidelidade"
      subtitle="320 pontos · ganhar/resgatar/histórico entram na Fase 14."
      onBack={() => router.back()}
    />
  );
}
