import { useLocalSearchParams, useRouter } from 'expo-router';

import { DevStub } from '@components/index';
import { findWine } from '@data/index';

/** Stub das Avaliações (Fase 8). */
export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const wine = findWine(id ?? '');

  return (
    <DevStub
      title="Avaliações"
      subtitle={`${wine.nome} · nota ${wine.notaMedia} — lista e formulário entram na Fase 8.`}
      onBack={() => router.back()}
    />
  );
}
